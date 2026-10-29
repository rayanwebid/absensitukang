import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Aset publik: model AI biometrik, file statis Next.js, manifest, ikon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/models") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icon-") ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js|bin|json)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Rute API Autentikasi yang diizinkan tanpa login
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // 3. Baca Cookie Sesi
  const sessionCookie = request.cookies.get("smkmuh2_session");
  let sessionUser: { id: string; name: string; username: string; role: string } | null = null;

  if (sessionCookie && sessionCookie.value) {
    try {
      const decoded = atob(sessionCookie.value);
      sessionUser = JSON.parse(decoded);
    } catch (e) {
      sessionUser = null;
    }
  }

  const isLoginPage = pathname === "/login";

  // 4. JIKA BELUM LOGIN:
  if (!sessionUser || !sessionUser.id || !sessionUser.role) {
    // Jika memanggil API selain login -> tolak 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda harus login terlebih dahulu untuk mengakses sistem ini." },
        { status: 401 }
      );
    }

    // Jika sudah di halaman /login, izinkan tampil
    if (isLoginPage) {
      return NextResponse.next();
    }

    // Redirect semua halaman lainnya ke /login
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. JIKA SUDAH LOGIN dan membuka halaman /login:
  if (isLoginPage) {
    if (sessionUser.role === "TUKANG") {
      return NextResponse.redirect(new URL("/absensi", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 6. Rute Root '/' diarahkan sesuai peran
  if (pathname === "/") {
    if (sessionUser.role === "TUKANG") {
      return NextResponse.redirect(new URL("/absensi", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 7. Proteksi Hak Akses (Role-Based Access Control / RBAC)
  // Pengguna dengan peran 'TUKANG' hanya berhak membuka:
  // - /absensi (presensi kamera)
  // - /absensi/riwayat (riwayat presensi)
  // Tidak boleh mengakses dashboard admin, manajemen tukang, jadwal, laporan, dll.
  const adminPages = [
    "/dashboard",
    "/tukang",
    "/tukang/tambah",
    "/jadwal",
    "/proyek",
    "/laporan",
    "/pengguna",
    "/pengaturan",
    "/audit-log",
  ];

  if (sessionUser.role === "TUKANG") {
    const isAccessingAdmin = adminPages.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    );
    if (isAccessingAdmin) {
      return NextResponse.redirect(new URL("/absensi", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
