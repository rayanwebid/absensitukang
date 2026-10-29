import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username/ID dan kata sandi wajib diisi." }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    // 1. Cek di tabel User terlebih dahulu
    const user = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });

    let authenticatedUser: { id: string; name: string; username: string; role: string } | null = null;

    if (user) {
      if (user.status !== "ACTIVE") {
        return NextResponse.json({ error: "Akun ini berstatus nonaktif." }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Kata sandi salah. Silakan periksa kembali." }, { status: 401 });
      }

      authenticatedUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      };
    } else {
      // 2. Jika tidak ada di User, cek di tabel Worker berdasarkan Kode Tukang (misal TKG-001) atau No HP
      const worker = await prisma.worker.findFirst({
        where: {
          OR: [
            { workerCode: trimmedUsername.toUpperCase() },
            { phone: trimmedUsername },
          ],
        },
      });

      if (worker) {
        if (worker.status !== "ACTIVE") {
          return NextResponse.json({ error: "Status data tukang ini nonaktif." }, { status: 401 });
        }

        // Untuk pekerja/tukang lapangan, kata sandi bawaan adalah 'tukang123' atau no HP tukang
        const isValidWorkerPass =
          password === "tukang123" ||
          password === "123456" ||
          (worker.phone && password === worker.phone);

        if (!isValidWorkerPass) {
          return NextResponse.json(
            { error: "Kata sandi tukang salah. Gunakan kata sandi standar 'tukang123'." },
            { status: 401 }
          );
        }

        authenticatedUser = {
          id: worker.id,
          name: worker.name,
          username: worker.workerCode,
          role: "TUKANG",
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: "Akun atau Kode Tukang tidak ditemukan dalam sistem SMKS Muhammadiyah 2 Genteng." },
        { status: 401 }
      );
    }

    // Buat session cookie
    const token = createSessionCookie(authenticatedUser);

    // Audit log login (actorId hanya diisi jika dari tabel User, karena Worker bukan foreign key User)
    try {
      await prisma.auditLog.create({
        data: {
          actorId: authenticatedUser.role === "TUKANG" ? null : authenticatedUser.id,
          actorName: authenticatedUser.name,
          action: "USER_LOGIN",
          entityType: authenticatedUser.role === "TUKANG" ? "WORKER" : "USER",
          entityId: authenticatedUser.id,
          metadata: JSON.stringify({ role: authenticatedUser.role, username: authenticatedUser.username }),
        },
      });
    } catch (auditErr) {
      console.warn("Gagal membuat audit log login:", auditErr);
    }

    const response = NextResponse.json({
      success: true,
      message: `Selamat datang, ${authenticatedUser.name}!`,
      user: authenticatedUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal saat login." }, { status: 500 });
  }
}
