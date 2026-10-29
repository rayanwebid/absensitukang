import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "PENGAWAS")) {
      return NextResponse.json({ error: "Tidak memiliki hak akses untuk mendaftarkan biometrik wajah." }, { status: 403 });
    }

    const { embedding, samplePhoto, consentAgreed } = await req.json();

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 128) {
      return NextResponse.json({ error: "Embedding biometrik tidak valid (harus 128 vektor float)." }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
    });

    if (!worker) {
      return NextResponse.json({ error: "Tukang tidak ditemukan." }, { status: 404 });
    }

    const faceProfile = await prisma.faceProfile.upsert({
      where: { workerId: worker.id },
      update: {
        encryptedEmbedding: JSON.stringify(embedding),
        modelVersion: "vladmandic-face-api-v1",
        consentStatus: !!consentAgreed,
        consentTimestamp: new Date(),
        samplePhoto: samplePhoto || null,
        updatedAt: new Date(),
      },
      create: {
        workerId: worker.id,
        encryptedEmbedding: JSON.stringify(embedding),
        modelVersion: "vladmandic-face-api-v1",
        consentStatus: !!consentAgreed,
        consentTimestamp: new Date(),
        samplePhoto: samplePhoto || null,
      },
    });

    // Audit Log Biometrik
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "FACE_BIOMETRIC_REGISTERED",
        entityType: "FACE_PROFILE",
        entityId: faceProfile.id,
        metadata: JSON.stringify({
          workerId: worker.id,
          workerCode: worker.workerCode,
          workerName: worker.name,
          consentStatus: !!consentAgreed,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Template biometrik wajah untuk ${worker.name} berhasil disimpan!`,
      faceProfile: {
        id: faceProfile.id,
        workerId: faceProfile.workerId,
        modelVersion: faceProfile.modelVersion,
        consentStatus: faceProfile.consentStatus,
        createdAt: faceProfile.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Face registration error:", error);
    return NextResponse.json({ error: "Gagal menyimpan biometrik wajah: " + error.message }, { status: 500 });
  }
}
