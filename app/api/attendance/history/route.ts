import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const workerId = searchParams.get("workerId");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};

    if (date) {
      where.workDate = date;
    } else if (startDate && endDate) {
      where.workDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (workerId) {
      where.workerId = workerId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (projectId && projectId !== "ALL") {
      where.worker = {
        assignments: {
          some: {
            projectId: projectId,
            isActive: true,
          },
        },
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
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
        schedule: true,
        events: {
          orderBy: { serverTimestamp: "asc" },
        },
      },
      orderBy: [{ workDate: "desc" }, { checkInAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ success: true, count: attendances.length, attendances });
  } catch (error: any) {
    console.error("Attendance history error:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat absensi." }, { status: 500 });
  }
}
