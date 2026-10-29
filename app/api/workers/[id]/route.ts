import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
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
          include: { project: true },
        },
        attendances: {
          take: 30,
          orderBy: { workDate: "desc" },
          include: { schedule: true },
        },
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Data tukang tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, worker });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengambil data tukang." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, jobType, status, notes } = body;

    const updated = await prisma.worker.update({
      where: { id: params.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone ? phone.trim() : null } : {}),
        ...(jobType ? { jobType } : {}),
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "UPDATE_WORKER",
        entityType: "WORKER",
        entityId: updated.id,
        metadata: JSON.stringify({ name: updated.name, status: updated.status }),
      },
    });

    return NextResponse.json({ success: true, worker: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui tukang: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat menonaktifkan tukang." }, { status: 403 });
    }

    const worker = await prisma.worker.update({
      where: { id: params.id },
      data: { status: "INACTIVE" },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "DEACTIVATE_WORKER",
        entityType: "WORKER",
        entityId: worker.id,
        metadata: JSON.stringify({ workerCode: worker.workerCode, name: worker.name }),
      },
    });

    return NextResponse.json({ success: true, message: "Status tukang berhasil dinonaktifkan." });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menonaktifkan tukang." }, { status: 500 });
  }
}
