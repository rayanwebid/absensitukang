import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        supervisor: {
          select: { id: true, name: true, role: true },
        },
        assignments: {
          where: { isActive: true },
          include: {
            worker: {
              select: {
                id: true,
                workerCode: true,
                name: true,
                jobType: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat proyek." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { projectName, location, description, status, supervisorId } = await req.json();

    if (!projectName || projectName.trim().length < 3) {
      return NextResponse.json({ error: "Nama proyek wajib diisi (minimal 3 karakter)." }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        projectName: projectName.trim(),
        location: location || "Lingkungan SMKS Muhammadiyah 2 Genteng",
        description: description || null,
        status: status || "IN_PROGRESS",
        supervisorId: supervisorId || session.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "CREATE_PROJECT",
        entityType: "PROJECT",
        entityId: project.id,
        metadata: JSON.stringify({ projectName, status }),
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal membuat proyek: " + error.message }, { status: 500 });
  }
}
