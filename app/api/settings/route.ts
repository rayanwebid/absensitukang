import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.settingKey] = s.settingValue;
    }
    return NextResponse.json({ success: true, settings: map, raw: settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat pengaturan sistem." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat mengubah pengaturan sistem." }, { status: 403 });
    }

    const { settings } = await req.json();

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Data pengaturan tidak valid." }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { settingKey: key },
        update: { settingValue: String(value), updatedBy: session.name },
        create: { settingKey: key, settingValue: String(value), updatedBy: session.name },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "UPDATE_SYSTEM_SETTINGS",
        entityType: "SYSTEM",
        metadata: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui." });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui pengaturan: " + error.message }, { status: 500 });
  }
}
