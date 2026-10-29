import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat pengguna." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat menambahkan akun pengguna." }, { status: 403 });
    }

    const { name, username, email, password, role } = await req.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "Nama, username, password, dan peran wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: username.trim(),
        email: email ? email.trim() : null,
        passwordHash,
        role,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorName: session.name,
        action: "CREATE_USER",
        entityType: "USER",
        entityId: newUser.id,
        metadata: JSON.stringify({ username, role }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal membuat pengguna: " + error.message }, { status: 500 });
  }
}
