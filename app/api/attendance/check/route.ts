import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEuclideanDistance, FACE_MATCH_THRESHOLD } from "@/lib/biometrics";
import { getWibNow, getWibDateString, getWibTimeString, evaluateCheckInStatus } from "@/lib/time";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventType, // "CHECK_IN" | "CHECK_OUT"
      embedding, // number[] (128-d)
      photoSnapshot, // base64 string
      livenessPassed, // boolean
      livenessScore, // number
      isManualOverride, // boolean (optional supervisor override)
      manualWorkerId, // string (if manual override)
      manualReason, // string (if manual override)
    } = body;

    if (!eventType || (eventType !== "CHECK_IN" && eventType !== "CHECK_OUT")) {
      return NextResponse.json({ error: "Tipe absensi tidak valid. Pilih CHECK_IN atau CHECK_OUT." }, { status: 400 });
    }

    const serverNow = getWibNow();
    const workDate = getWibDateString(serverNow);
    const serverTimeStr = getWibTimeString(serverNow);

    // Ambil jadwal aktif
    const activeSchedule = await prisma.workSchedule.findFirst({
      where: { isActive: true },
    });
    const schedStartTime = activeSchedule?.startTime || "07:00";
    const schedGrace = activeSchedule?.gracePeriod ?? 15;

    let targetWorker: any = null;
    let matchDistance: number | null = null;
    let verificationMethod = "FACE_BIOMETRIC";

    // 1. Jalur Manual Pengawas (Supervisor Override)
    if (isManualOverride) {
      const session = await getSessionUser();
      if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
        return NextResponse.json({ error: "Hanya Pengawas atau Super Admin yang dapat melakukan absensi manual." }, { status: 403 });
      }

      if (!manualWorkerId) {
        return NextResponse.json({ error: "Pilih tukang yang akan diabsenkan secara manual." }, { status: 400 });
      }

      if (!manualReason || manualReason.trim().length < 4) {
        return NextResponse.json({ error: "Alasan absensi manual wajib diisi secara jelas (minimal 4 karakter)." }, { status: 400 });
      }

      targetWorker = await prisma.worker.findUnique({
        where: { id: manualWorkerId },
        include: {
          assignments: {
            where: { isActive: true },
            include: { project: true },
            take: 1,
          },
        },
      });

      if (!targetWorker || targetWorker.status !== "ACTIVE") {
        return NextResponse.json({ error: "Data tukang tidak ditemukan atau berstatus non-aktif." }, { status: 400 });
      }

      verificationMethod = `MANUAL_OVERRIDE (${session.name})`;
    } else {
      // 2. Jalur Face Recognition Biometrik
      if (!embedding || !Array.isArray(embedding) || embedding.length !== 128) {
        return NextResponse.json({ error: "Embedding biometrik wajah tidak valid." }, { status: 400 });
      }

      // Ambil threshold dari pengaturan sistem jika ada
      const settingThreshold = await prisma.systemSetting.findUnique({
        where: { settingKey: "face_match_threshold" },
      });
      const threshold = settingThreshold ? parseFloat(settingThreshold.settingValue) : FACE_MATCH_THRESHOLD;

      // Ambil semua profil wajah aktif
      const profiles = await prisma.faceProfile.findMany({
        where: {
          worker: { status: "ACTIVE" },
        },
        include: {
          worker: {
            include: {
              assignments: {
                where: { isActive: true },
                include: { project: true },
                take: 1,
              },
            },
          },
        },
      });

      if (profiles.length === 0) {
        return NextResponse.json(
          { error: "Belum ada data wajah tukang yang didaftarkan dalam sistem. Silakan registrasi terlebih dahulu." },
          { status: 400 }
        );
      }

      // Cari wajah paling cocok
      let minDistance = Infinity;
      let matchedProfile: any = null;

      for (const p of profiles) {
        try {
          const registeredVec = JSON.parse(p.encryptedEmbedding);
          const dist = calculateEuclideanDistance(embedding, registeredVec);
          if (dist < minDistance) {
            minDistance = dist;
            matchedProfile = p;
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      matchDistance = parseFloat(minDistance.toFixed(4));

      // Jika jarak melebihi ambang batas -> wajah tidak dikenali
      if (minDistance > threshold || !matchedProfile) {
        // Catat jejak percobaan gagal untuk keamanan
        await prisma.auditLog.create({
          data: {
            actorName: "Sistem Face Biometrik",
            action: "FACE_MATCH_FAILED",
            entityType: "ATTENDANCE",
            metadata: JSON.stringify({
              eventType,
              minDistance: matchDistance,
              threshold,
              timestamp: serverNow.toISOString(),
            }),
          },
        });

        return NextResponse.json(
          {
            error: "Wajah tidak cocok dengan data tukang terdaftar.",
            detail: `Jarak Euclidean: ${matchDistance} (Ambang batas: ${threshold}). Pastikan pencahayaan cukup dan wajah menghadap kamera dengan jelas.`,
            distanceScore: matchDistance,
          },
          { status: 422 }
        );
      }

      targetWorker = matchedProfile.worker;
    }

    // 3. Validasi Duplikasi Absensi (Anti Double Attendance)
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        workerId_workDate: {
          workerId: targetWorker.id,
          workDate,
        },
      },
    });

    if (eventType === "CHECK_IN") {
      if (existingAttendance && existingAttendance.checkInAt) {
        const checkedInTimeStr = getWibTimeString(existingAttendance.checkInAt);
        return NextResponse.json(
          {
            error: `Tukang ${targetWorker.name} (${targetWorker.workerCode}) SUDAH melakukan Absen Masuk hari ini pada pukul ${checkedInTimeStr} WIB.`,
            isDuplicate: true,
            existingAttendance: {
              workDate,
              checkInAt: checkedInTimeStr,
              status: existingAttendance.status,
            },
          },
          { status: 409 }
        );
      }
    } else if (eventType === "CHECK_OUT") {
      if (!existingAttendance || !existingAttendance.checkInAt) {
        return NextResponse.json(
          {
            error: `Tukang ${targetWorker.name} (${targetWorker.workerCode}) BELUM melakukan Absen Masuk hari ini. Harap lakukan Absen Masuk terlebih dahulu.`,
            requireCheckInFirst: true,
          },
          { status: 400 }
        );
      }

      if (existingAttendance.checkOutAt) {
        const checkedOutTimeStr = getWibTimeString(existingAttendance.checkOutAt);
        return NextResponse.json(
          {
            error: `Tukang ${targetWorker.name} (${targetWorker.workerCode}) SUDAH melakukan Absen Pulang hari ini pada pukul ${checkedOutTimeStr} WIB.`,
            isDuplicate: true,
            existingAttendance: {
              workDate,
              checkInAt: getWibTimeString(existingAttendance.checkInAt),
              checkOutAt: checkedOutTimeStr,
              status: existingAttendance.status,
            },
          },
          { status: 409 }
        );
      }
    }

    // 4. Hitung Status Keterlambatan
    let attendanceStatus = "HADIR";
    let statusNote = "";

    if (eventType === "CHECK_IN") {
      const evalResult = evaluateCheckInStatus(serverNow, schedStartTime, schedGrace);
      attendanceStatus = evalResult.status;
      statusNote = evalResult.note;
    } else {
      attendanceStatus = existingAttendance?.status || "HADIR";
      statusNote = `Selesai kerja, absen pulang pukul ${serverTimeStr} WIB`;
    }

    // 5. Simpan / Perbarui Absensi
    let savedAttendance;
    if (eventType === "CHECK_IN") {
      savedAttendance = await prisma.attendance.upsert({
        where: {
          workerId_workDate: {
            workerId: targetWorker.id,
            workDate,
          },
        },
        update: {
          checkInAt: serverNow,
          status: attendanceStatus,
          scheduleId: activeSchedule?.id,
          checkInPhoto: photoSnapshot || null,
          checkInVerifiedBy: verificationMethod,
          notes: statusNote,
        },
        create: {
          workerId: targetWorker.id,
          workDate,
          checkInAt: serverNow,
          status: attendanceStatus,
          scheduleId: activeSchedule?.id,
          checkInPhoto: photoSnapshot || null,
          checkInVerifiedBy: verificationMethod,
          notes: statusNote,
        },
      });
    } else {
      savedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance!.id },
        data: {
          checkOutAt: serverNow,
          checkOutPhoto: photoSnapshot || null,
          checkOutVerifiedBy: verificationMethod,
        },
      });
    }

    // 6. Catat Event Absensi
    await prisma.attendanceEvent.create({
      data: {
        attendanceId: savedAttendance.id,
        eventType,
        serverTimestamp: serverNow,
        verificationResult: isManualOverride ? "MANUAL" : "SUCCESS",
        distanceScore: matchDistance,
        livenessScore: livenessScore ? parseFloat(livenessScore.toFixed(3)) : 1.0,
        reason: isManualOverride ? manualReason : statusNote,
        actorName: targetWorker.name,
        photoSnapshot: photoSnapshot || null,
      },
    });

    // 7. Catat Audit Log
    await prisma.auditLog.create({
      data: {
        actorName: isManualOverride ? verificationMethod : targetWorker.name,
        action: `ATTENDANCE_${eventType}`,
        entityType: "ATTENDANCE",
        entityId: savedAttendance.id,
        metadata: JSON.stringify({
          workerCode: targetWorker.workerCode,
          workerName: targetWorker.name,
          workDate,
          serverTime: serverTimeStr,
          status: attendanceStatus,
          method: verificationMethod,
          distanceScore: matchDistance,
        }),
      },
    });

    // Ambil info proyek
    const projectName = targetWorker.assignments?.[0]?.project?.projectName || "Proyek SMKS Muhammadiyah 2 Genteng";
    const projectRole = targetWorker.assignments?.[0]?.roleInProject || targetWorker.jobType;

    // 8. Berikan Bukti Absensi (Receipt Confirmation)
    return NextResponse.json({
      success: true,
      message: `Absen ${eventType === "CHECK_IN" ? "Masuk" : "Pulang"} Berhasil Dikonfirmasi!`,
      receipt: {
        id: savedAttendance.id,
        workerId: targetWorker.id,
        workerCode: targetWorker.workerCode,
        workerName: targetWorker.name,
        jobType: targetWorker.jobType,
        projectName,
        projectRole,
        eventType,
        workDate,
        serverTime: serverTimeStr,
        status: attendanceStatus,
        statusNote,
        verificationMethod,
        distanceScore: matchDistance,
        photoSnapshot: photoSnapshot || null,
      },
    });
  } catch (error: any) {
    console.error("Attendance check error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memproses absensi.", details: error.message }, { status: 500 });
  }
}
