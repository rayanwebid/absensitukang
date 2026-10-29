import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWibNow, getWibDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const todayStr = getWibDateString(getWibNow());

    // 1. Total Tukang Aktif
    const totalActiveWorkers = await prisma.worker.count({
      where: { status: "ACTIVE" },
    });

    // 2. Data Absensi Hari Ini
    const todayAttendances = await prisma.attendance.findMany({
      where: { workDate: todayStr },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
            workerCode: true,
            jobType: true,
          },
        },
      },
    });

    const hadirCount = todayAttendances.filter((a) => a.checkInAt && a.status === "HADIR").length;
    const terlambatCount = todayAttendances.filter((a) => a.status === "TERLAMBAT").length;
    const izinSakitCount = todayAttendances.filter((a) => a.status === "IZIN" || a.status === "SAKIT").length;
    const totalCheckedIn = todayAttendances.filter((a) => a.checkInAt !== null).length;
    const belumAbsenMasukCount = Math.max(0, totalActiveWorkers - totalCheckedIn - izinSakitCount);
    const checkedOutCount = todayAttendances.filter((a) => a.checkOutAt !== null).length;
    const belumAbsenPulangCount = totalCheckedIn - checkedOutCount;

    // 3. Aktivitas Terbaru (Recent Events)
    const recentEvents = await prisma.attendanceEvent.findMany({
      take: 10,
      orderBy: { serverTimestamp: "desc" },
      include: {
        attendance: {
          include: {
            worker: true,
          },
        },
      },
    });

    // 4. Proyek Aktif
    const activeProjects = await prisma.project.findMany({
      where: { status: "IN_PROGRESS" },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    // 5. Tren 7 Hari Terakhir
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getWibDateString(d));
    }

    const weeklyTrend = await Promise.all(
      last7Days.map(async (dateStr) => {
        const counts = await prisma.attendance.groupBy({
          by: ["status"],
          where: { workDate: dateStr },
          _count: { id: true },
        });

        const hadir = counts.find((c) => c.status === "HADIR")?._count.id || 0;
        const terlambat = counts.find((c) => c.status === "TERLAMBAT")?._count.id || 0;
        const izin = counts.find((c) => c.status === "IZIN" || c.status === "SAKIT")?._count.id || 0;

        return {
          date: dateStr,
          hadir,
          terlambat,
          izin,
          total: hadir + terlambat,
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats: {
        todayDate: todayStr,
        totalActiveWorkers,
        hadirCount,
        terlambatCount,
        izinSakitCount,
        belumAbsenMasukCount,
        belumAbsenPulangCount,
        checkedOutCount,
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        workerName: e.attendance.worker.name,
        workerCode: e.attendance.worker.workerCode,
        jobType: e.attendance.worker.jobType,
        eventType: e.eventType,
        verificationResult: e.verificationResult,
        serverTimestamp: e.serverTimestamp,
        distanceScore: e.distanceScore,
        photoSnapshot: e.photoSnapshot,
        reason: e.reason,
      })),
      activeProjects,
      weeklyTrend,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik dashboard." }, { status: 500 });
  }
}
