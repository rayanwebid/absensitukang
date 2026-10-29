import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        worker: {
          select: {
            id: true,
            workerCode: true,
            name: true,
            jobType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, leaveRequests });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat pengajuan izin." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { workerId, leaveType, startDate, endDate, reason } = await req.json();

    if (!workerId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Semua kolom permohonan izin/sakit wajib diisi." }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        workerId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason.trim(),
        approvalStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true, leave });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengajukan izin: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
      return NextResponse.json({ error: "Hanya Pengawas atau Admin yang dapat menyetujui izin." }, { status: 403 });
    }

    const { id, approvalStatus, approvalNotes } = await req.json();

    if (!id || (approvalStatus !== "APPROVED" && approvalStatus !== "REJECTED")) {
      return NextResponse.json({ error: "Status persetujuan tidak valid." }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        approvalStatus,
        approvedBy: session.name,
        approvalNotes: approvalNotes || null,
      },
      include: { worker: true },
    });

    // Jika disetujui, buatkan catatan kehadiran otomatis dengan status IZIN atau SAKIT untuk tanggal tersebut
    if (approvalStatus === "APPROVED") {
      const start = new Date(updated.startDate);
      const end = new Date(updated.endDate);
      const cur = new Date(start);

      while (cur <= end) {
        const dateStr = cur.toISOString().split("T")[0];
        await prisma.attendance.upsert({
          where: {
            workerId_workDate: {
              workerId: updated.workerId,
              workDate: dateStr,
            },
          },
          update: {
            status: updated.leaveType,
            notes: `Disetujui oleh ${session.name}: ${updated.reason}`,
          },
          create: {
            workerId: updated.workerId,
            workDate: dateStr,
            status: updated.leaveType,
            notes: `Disetujui oleh ${session.name}: ${updated.reason}`,
          },
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: `LEAVE_${approvalStatus}`,
        entityType: "LEAVE_REQUEST",
        entityId: updated.id,
        metadata: JSON.stringify({ workerName: updated.worker.name, status: approvalStatus }),
      },
    });

    return NextResponse.json({ success: true, leave: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memproses persetujuan izin: " + error.message }, { status: 500 });
  }
}
