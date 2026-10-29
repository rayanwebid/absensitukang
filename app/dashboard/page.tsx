"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  FileText,
  Briefcase,
  Camera,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  HardHat,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatIndonesianDate } from "@/lib/time";

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.stats) {
        setStatsData(data);
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 15000); // live refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const stats = statsData?.stats;
  const recentEvents = statsData?.recentEvents || [];
  const activeProjects = statsData?.activeProjects || [];
  const weeklyTrend = statsData?.weeklyTrend || [];

  const totalWorkers = stats?.totalActiveWorkers || 0;
  const totalHadir = (stats?.hadirCount || 0) + (stats?.terlambatCount || 0);
  const attendanceRate = totalWorkers > 0 ? Math.round((totalHadir / totalWorkers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-muh-navy via-muh-blue to-muh-darkblue rounded-3xl p-5 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-muh-teal/30">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muh-teal/20 text-muh-teal text-[11px] font-bold tracking-wide uppercase border border-muh-teal/30">
            <span>SMKS Muhammadiyah 2 Genteng</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">Dashboard Presensi Lapangan</h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Pemantauan kehadiran dan jam kerja tukang proyek secara terpusat & real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/absensi"
            className="py-2.5 px-4 rounded-xl bg-muh-teal hover:bg-cyan-300 text-muh-navy font-black text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Absensi</span>
          </Link>
          <Link
            href="/tukang/tambah"
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors"
          >
            <Users className="w-4 h-4 text-muh-gold" />
            <span>+ Tukang Baru</span>
          </Link>
          <Link
            href="/laporan"
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Laporan</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Statistic Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Tukang */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Total Tukang</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats?.totalActiveWorkers ?? "--"}</div>
            <div className="text-[10px] text-slate-400 font-medium">Pekerja aktif</div>
          </div>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700">Tepat Waktu</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">{stats?.hadirCount ?? "--"}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Hadir sebelum 07.15</div>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700">Terlambat</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700">{stats?.terlambatCount ?? "--"}</div>
            <div className="text-[10px] text-amber-600 font-medium">Setelah toleransi</div>
          </div>
        </div>

        {/* Izin / Sakit */}
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-700">Izin / Sakit</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-700">{stats?.izinSakitCount ?? "--"}</div>
            <div className="text-[10px] text-sky-600 font-medium">Pengajuan sah</div>
          </div>
        </div>

        {/* Belum Absen Masuk */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700">Belum Masuk</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-700">{stats?.belumAbsenMasukCount ?? "--"}</div>
            <div className="text-[10px] text-rose-600 font-medium">Belum hadir hari ini</div>
          </div>
        </div>

        {/* Belum Absen Pulang */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700">Masih Di Lapangan</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-700">{stats?.belumAbsenPulangCount ?? "--"}</div>
            <div className="text-[10px] text-indigo-600 font-medium">Belum absen pulang</div>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Trend & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend Chart Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muh-teal" />
                <span>Tren Kehadiran 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-slate-400">Grafik perbandingan hadir tepat waktu vs terlambat</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Hadir
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Terlambat
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-2">
              {weeklyTrend.map((d: any) => {
                const total = d.hadir + d.terlambat;
                const hadirHeight = total > 0 ? (d.hadir / 6) * 100 : 0;
                const terlambatHeight = total > 0 ? (d.terlambat / 6) * 100 : 0;
                const dayName = new Date(d.date).toLocaleDateString("id-ID", { weekday: "short" });

                return (
                  <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {total}
                    </div>
                    <div className="w-full max-w-[28px] flex flex-col justify-end gap-1 h-32 rounded-lg bg-slate-100 p-1">
                      {d.terlambat > 0 && (
                        <div
                          style={{ height: `${Math.min(100, terlambatHeight)}%` }}
                          className="bg-amber-400 rounded-sm transition-all"
                          title={`Terlambat: ${d.terlambat}`}
                        ></div>
                      )}
                      {d.hadir > 0 && (
                        <div
                          style={{ height: `${Math.min(100, hadirHeight)}%` }}
                          className="bg-emerald-500 rounded-sm transition-all"
                          title={`Hadir: ${d.hadir}`}
                        ></div>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">{dayName}</div>
                    <div className="text-[9px] text-slate-400">{d.date.slice(8)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs text-slate-600">
            <span>Tingkat Kehadiran Hari Ini:</span>
            <span className="font-extrabold text-muh-navy text-sm">{attendanceRate}%</span>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muh-blue" />
                <span>Proyek Lapangan Aktif</span>
              </h3>
              <Link href="/proyek" className="text-xs text-muh-teal font-bold hover:underline">
                Kelola
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-3">SMKS Muhammadiyah 2 Genteng</p>

            <div className="space-y-2.5">
              {activeProjects.map((p: any) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{p.projectName}</h4>
                    <span className="text-[10px] font-bold text-muh-darkblue bg-muh-light px-2 py-0.5 rounded-full">
                      {p._count?.assignments || 0} Tukang
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{p.location}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/proyek"
            className="w-full py-2.5 text-center text-xs font-bold text-muh-blue hover:text-muh-navy bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Lihat Semua Proyek →
          </Link>
        </div>
      </div>

      {/* Live Recent Activity Feed */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Aktivitas Presensi Terbaru (Live Feed)</span>
            </h3>
            <p className="text-xs text-slate-400">Jejak verifikasi biometrik wajah dan waktu server aktual</p>
          </div>
          <Link href="/absensi/riwayat" className="text-xs font-bold text-muh-blue hover:underline">
            Lihat Semua Riwayat
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">Belum ada aktivitas presensi hari ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentEvents.map((e: any) => {
              const isCheckIn = e.eventType === "CHECK_IN";
              return (
                <div
                  key={e.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {e.photoSnapshot ? (
                      <img
                        src={e.photoSnapshot}
                        alt={e.workerName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        <HardHat className="w-5 h-5 text-muh-navy" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muh-darkblue bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {e.workerCode}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{e.workerName}</h4>
                      </div>
                      <div className="text-[11px] text-slate-500">{e.jobType}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{e.reason || "Terverifikasi Wajah"}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCheckIn ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isCheckIn ? "Absen Masuk" : "Absen Pulang"}
                    </span>
                    <span className="block font-mono font-bold text-xs text-slate-800 mt-1">
                      {new Date(e.serverTimestamp).toLocaleTimeString("id-ID")} WIB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
