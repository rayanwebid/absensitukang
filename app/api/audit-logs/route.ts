import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: "desc" },
      include: {
        actor: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat audit log." }, { status: 500 });
  }
}
