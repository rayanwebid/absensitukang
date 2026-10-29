"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, CheckCircle2, Lock, X } from "lucide-react";

export default function PenggunaPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New user modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PENGAWAS");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error("Fetch users error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal membuat pengguna.");
      } else {
        setModalOpen(false);
        setName("");
        setUsername("");
        setPassword("");
        fetchUsers();
      }
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Pengguna & Peran
          </h1>
          <p className="text-xs text-slate-500">
            Kelola hak akses Super Admin, Pengawas Lapangan, dan akun sistem SMKS Muhammadiyah 2 Genteng.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4 text-muh-teal" />
          <span>+ Tambah Akun Pengguna</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Memuat pengguna...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => {
            const isSuperAdmin = u.role === "SUPER_ADMIN";
            const isPengawas = u.role === "PENGAWAS";

            return (
              <div
                key={u.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      isSuperAdmin
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : isPengawas
                        ? "bg-muh-light text-muh-darkblue border border-muh-teal/30"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{u.name}</h3>
                    <div className="text-xs text-slate-500 font-mono">@{u.username}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{u.email || "Tanpa email"}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isSuperAdmin
                        ? "bg-amber-100 text-amber-800"
                        : isPengawas
                        ? "bg-cyan-100 text-cyan-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {u.role.replace("_", " ")}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-medium mt-1">● Aktif</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-muh-navy text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Akun Pengguna</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ir. Muhammad Fauzi"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: fauzi"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fauzi@smkmuh2genteng.sch.id"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran Akun</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="PENGAWAS">Pengawas / Admin Lapangan</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
