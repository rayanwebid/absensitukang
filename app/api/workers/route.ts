import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWibDateString, getWibNow } from "@/lib/time";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const todayStr = getWibDateString(getWibNow());

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }
    if (search.trim()) {
      where.OR = [
        { name: { contains: search } },
        { workerCode: { contains: search } },
        { jobType: { contains: search } },
      ];
    }

    const workers = await prisma.worker.findMany({
      where,
      include: {
        faceProfile: {
          select: {
            id: true,
            modelVersion: true,
            consentStatus: true,
            createdAt: true,
            samplePhoto: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: { project: true },
          take: 1,
        },
        attendances: {
          where: { workDate: todayStr },
          take: 1,
        },
      },
      orderBy: { workerCode: "asc" },
    });

    const formatted = workers.map((w) => {
      const todayAtt = w.attendances[0];
      return {
        id: w.id,
        workerCode: w.workerCode,
        name: w.name,
        phone: w.phone,
        jobType: w.jobType,
        status: w.status,
        startDate: w.startDate,
        notes: w.notes,
        hasFaceRegistered: !!w.faceProfile,
        faceProfile: w.faceProfile,
        assignedProject: w.assignments[0]?.project || null,
        projectRole: w.assignments[0]?.roleInProject || w.jobType,
        todayAttendance: todayAtt
          ? {
              status: todayAtt.status,
              checkInAt: todayAtt.checkInAt,
              checkOutAt: todayAtt.checkOutAt,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, workers: formatted });
  } catch (error: any) {
    console.error("Workers fetch error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar tukang." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
      return NextResponse.json({ error: "Tidak memiliki hak akses untuk menambah tukang." }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, jobType, projectId, projectRole, notes, faceEmbedding, samplePhoto, consentAgreed } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Nama tukang wajib diisi." }, { status: 400 });
    }
    if (!jobType) {
      return NextResponse.json({ error: "Keahlian / jenis pekerjaan wajib dipilih." }, { status: 400 });
    }

    // Auto-generate workerCode (e.g. TKG-007)
    const count = await prisma.worker.count();
    const nextNum = (count + 1).toString().padStart(3, "0");
    const workerCode = `TKG-${nextNum}`;

    // Buat tukang baru
    const newWorker = await prisma.worker.create({
      data: {
        workerCode,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        jobType,
        status: "ACTIVE",
        notes: notes || null,
      },
    });

    // Hubungkan ke Proyek jika dipilih
    if (projectId) {
      await prisma.workerAssignment.create({
        data: {
          workerId: newWorker.id,
          projectId,
          roleInProject: projectRole || jobType,
          isActive: true,
        },
      });
    }

    // Daftarkan Face Profile jika disertakan
    if (faceEmbedding && Array.isArray(faceEmbedding) && faceEmbedding.length === 128) {
      await prisma.faceProfile.create({
        data: {
          workerId: newWorker.id,
          encryptedEmbedding: JSON.stringify(faceEmbedding),
          modelVersion: "vladmandic-face-api-v1",
          consentStatus: !!consentAgreed,
          consentTimestamp: new Date(),
          samplePhoto: samplePhoto || null,
        },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "CREATE_WORKER",
        entityType: "WORKER",
        entityId: newWorker.id,
        metadata: JSON.stringify({
          workerCode,
          name,
          jobType,
          withFaceRegistered: !!faceEmbedding,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Tukang ${name} (${workerCode}) berhasil didaftarkan!`,
      worker: newWorker,
    });
  } catch (error: any) {
    console.error("Create worker error:", error);
    return NextResponse.json({ error: "Gagal menambahkan tukang: " + error.message }, { status: 500 });
  }
}
