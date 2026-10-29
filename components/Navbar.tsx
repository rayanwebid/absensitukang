"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Briefcase,
  Sliders,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  History,
  HardHat,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; username: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Fetch logged in session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    // Live clock ticker
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(now)
        .replace(/\./g, ":");
      setCurrentTime(timeStr + " WIB");
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const navLinks = [
    { href: "/absensi", label: "Absensi Kamera", icon: Camera, primary: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tukang", label: "Data Tukang", icon: Users },
    { href: "/jadwal", label: "Jadwal", icon: Clock },
    { href: "/izin", label: "Izin & Sakit", icon: FileText },
    { href: "/proyek", label: "Proyek", icon: Briefcase },
    { href: "/laporan", label: "Laporan", icon: History },
  ];

  const adminLinks = [
    { href: "/pengguna", label: "Pengguna", icon: Users },
    { href: "/pengaturan", label: "Pengaturan", icon: Sliders },
    { href: "/audit-log", label: "Audit Log", icon: ShieldCheck },
  ];

  // Don't render full navbar on pure fullscreen camera if not needed, but keep it clean
  if (pathname === "/login") return null;

  return (
    <>
      {/* Top Header */}
      <header className="bg-muh-navy text-white sticky top-0 z-40 border-b border-muh-blue shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* School Brand */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-muh-blue border border-muh-teal/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <HardHat className="w-6 h-6 text-muh-gold" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-1.5 text-white">
                    <span>SMKS MUHAMMADIYAH 2 GENTENG</span>
                  </div>
                  <div className="text-[11px] text-muh-teal font-medium flex items-center gap-1">
                    <span>Sistem Absensi Biometrik Wajah Tukang</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      link.primary
                        ? "bg-muh-teal text-muh-navy font-bold hover:bg-cyan-300 shadow-sm"
                        : isActive
                        ? "bg-muh-blue text-white shadow-sm"
                        : "text-slate-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Admin Dropdown / Direct Links */}
              {user?.role === "SUPER_ADMIN" && (
                <div className="relative group">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800">
                    <Sliders className="w-4 h-4 text-muh-gold" />
                    <span>Admin</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>
                  <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                    {adminLinks.map((al) => {
                      const Icon = al.icon;
                      return (
                        <Link
                          key={al.href}
                          href={al.href}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-muh-blue hover:text-white"
                        >
                          <Icon className="w-4 h-4 text-muh-teal" />
                          <span>{al.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* Right section: Server WIB Clock & User info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-bold text-muh-gold font-mono tracking-wider">{currentTime || "--:--:-- WIB"}</span>
                <span className="text-[10px] text-slate-300">Waktu Resmi Server</span>
              </div>

              {user && (
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] font-medium text-muh-teal capitalize">{user.role.replace("_", " ")}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Keluar / Logout"
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors border border-slate-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
            <div className="py-2 px-3 mb-2 rounded-lg bg-muh-navy/80 border border-muh-blue/40 flex justify-between items-center text-xs">
              <span className="text-slate-300">Waktu Server (WIB):</span>
              <span className="font-mono font-bold text-muh-gold">{currentTime}</span>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    link.primary
                      ? "bg-muh-teal text-muh-navy font-bold shadow"
                      : isActive
                      ? "bg-muh-blue text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user?.role === "SUPER_ADMIN" && (
              <div className="pt-2 border-t border-slate-800 mt-2">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Menu Super Admin
                </div>
                {adminLinks.map((al) => {
                  const Icon = al.icon;
                  return (
                    <Link
                      key={al.href}
                      href={al.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <Icon className="w-5 h-5 text-muh-teal" />
                      <span>{al.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Quick Mobile Bottom Bar for Fast Attendance Access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 flex justify-around items-center">
        <Link
          href="/absensi"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-transform active:scale-95 ${
            pathname === "/absensi" ? "text-muh-teal font-bold" : "text-slate-400"
          }`}
        >
          <div className="w-10 h-10 -mt-5 bg-gradient-to-tr from-muh-blue to-muh-teal rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 text-white">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Absensi</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            pathname === "/dashboard" ? "text-muh-teal font-bold" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link
          href="/tukang"
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            pathname === "/tukang" ? "text-muh-teal font-bold" : "text-slate-400"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Tukang</span>
        </Link>
        <Link
          href="/laporan"
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            pathname === "/laporan" ? "text-muh-teal font-bold" : "text-slate-400"
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Laporan</span>
        </Link>
      </div>
    </>
  );
}
