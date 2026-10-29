import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await prisma.faceProfile.findMany({
      where: {
        worker: {
          status: "ACTIVE",
        },
      },
      include: {
        worker: {
          select: {
            id: true,
            workerCode: true,
            name: true,
            jobType: true,
            photoUrl: true,
            assignments: {
              where: { isActive: true },
              include: { project: { select: { projectName: true } } },
              take: 1,
            },
          },
        },
      },
    });

    const formatted = profiles.map((p) => {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(p.encryptedEmbedding);
      } catch (e) {
        console.error("Failed to parse embedding for worker", p.workerId);
      }

      return {
        id: p.id,
        workerId: p.worker.id,
        workerCode: p.worker.workerCode,
        name: p.worker.name,
        jobType: p.worker.jobType,
        projectName: p.worker.assignments[0]?.project?.projectName || "Umum / Tanpa Proyek",
        samplePhoto: p.samplePhoto,
        embedding,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, profiles: formatted });
  } catch (error: any) {
    console.error("Error fetching registered faces:", error);
    return NextResponse.json({ error: "Gagal mengambil profil wajah terdaftar." }, { status: 500 });
  }
}
