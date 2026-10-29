"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HardHat, Lock, User, AlertCircle, ArrowRight, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk. Periksa kembali username dan password Anda.");
        setLoading(false);
        return;
      }

      // Route according to role
      if (data.user.role === "TUKANG") {
        if (fromPath && fromPath.startsWith("/absensi")) {
          router.push(fromPath);
        } else {
          router.push("/absensi");
        }
      } else {
        if (fromPath && fromPath !== "/login") {
          router.push(fromPath);
        } else {
          router.push("/dashboard");
        }
      }
      router.refresh();
    } catch (err: any) {
      setError("Kesalahan koneksi ke server: " + err.message);
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md space-y-5">
      {/* Brand Card */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-muh-navy border-2 border-muh-teal flex items-center justify-center shadow-xl shadow-muh-navy/20">
          <HardHat className="w-9 h-9 text-muh-gold" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          SMKS MUHAMMADIYAH 2 GENTENG
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Sistem Absensi Biometrik Wajah Tukang & Pekerja Lapangan
        </p>
      </div>

      {/* Security Protected Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Akses Wajib Login: </span>
          Kamera absensi dan seluruh data presensi dilindungi. Pekerja, pengawas, atau admin wajib masuk terlebih dahulu.
        </div>
      </div>

      {/* Login Box */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-200 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Autentikasi Pengguna</h2>
            <p className="text-xs text-slate-400">Masukkan akun admin, pengawas, atau tukang</p>
          </div>
          <KeyRound className="w-5 h-5 text-muh-teal" />
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username / Kode Tukang
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: admin, pengawas1, atau TKG-001"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-muh-navy/25 transition-all disabled:opacity-50"
          >
            <span>{loading ? "Memverifikasi..." : "Masuk & Buka Absensi"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Preset */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilihan Akun Uji Coba Cepat (1-Klik):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin", "admin123")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-[10px] font-bold text-muh-navy">👑 Super Admin</div>
              <div className="text-[9px] text-slate-400">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("pengawas1", "pengawas123")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-[10px] font-bold text-amber-700">👷 Pengawas</div>
              <div className="text-[9px] text-slate-400">pengawas1 / ...</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("TKG-001", "tukang123")}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="text-[10px] font-bold text-emerald-700">📱 Tukang TKG-001</div>
              <div className="text-[9px] text-slate-400">TKG-001 / ...</div>
            </button>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-muh-teal" />
        <span>Sesi Aman & Terlindungi Sesuai Regulasi SMKS Muhammadiyah 2 Genteng</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <Suspense fallback={<div className="text-xs text-slate-500">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
