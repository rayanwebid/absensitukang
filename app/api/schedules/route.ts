import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedules = await prisma.workSchedule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, schedules });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat jadwal." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Super Admin yang dapat mengubah jadwal." }, { status: 403 });
    }

    const { id, name, startTime, endTime, gracePeriod, workDays, isActive } = await req.json();

    if (!name || !startTime || !endTime) {
      return NextResponse.json({ error: "Nama jadwal, jam masuk, dan jam pulang wajib diisi." }, { status: 400 });
    }

    let schedule;
    if (id) {
      schedule = await prisma.workSchedule.update({
        where: { id },
        data: {
          name,
          startTime,
          endTime,
          gracePeriod: parseInt(gracePeriod, 10) || 15,
          workDays: workDays || "1,2,3,4,5,6",
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });
    } else {
      schedule = await prisma.workSchedule.create({
        data: {
          name,
          startTime,
          endTime,
          gracePeriod: parseInt(gracePeriod, 10) || 15,
          workDays: workDays || "1,2,3,4,5,6",
          isActive: isActive !== undefined ? !!isActive : true,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: id ? "UPDATE_SCHEDULE" : "CREATE_SCHEDULE",
        entityType: "SCHEDULE",
        entityId: schedule.id,
        metadata: JSON.stringify({ name, startTime, endTime, gracePeriod }),
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan jadwal: " + error.message }, { status: 500 });
  }
}
