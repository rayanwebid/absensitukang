"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Calendar, User, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatIndonesianDate } from "@/lib/time";

export default function RiwayatAbsensiPage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    fetchAttendances();
  }, [selectedStatus]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      let url = "/api/attendance/history?limit=100";
      if (selectedStatus !== "ALL") url += `&status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.attendances) {
        setAttendances(data.attendances);
      }
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = attendances.filter((a) => {
    const term = search.toLowerCase();
    return (
      a.worker.name.toLowerCase().includes(term) ||
      a.worker.workerCode.toLowerCase().includes(term) ||
      a.worker.jobType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/absensi"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">Riwayat Kehadiran Tukang</h1>
            <p className="text-xs text-slate-500">Pencatatan resmi absensi SMKS Muhammadiyah 2 Genteng</p>
          </div>
        </div>

        <Link
          href="/absensi"
          className="text-xs font-bold bg-muh-navy hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          📷 Absensi Kamera
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tukang, kode (TKG-...), atau keahlian..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="HADIR">Hadir Tepat Waktu</option>
            <option value="TERLAMBAT">Terlambat</option>
            <option value="IZIN">Izin</option>
            <option value="SAKIT">Sakit</option>
          </select>
        </div>
      </div>

      {/* List of Attendances */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Memuat riwayat kehadiran...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Catatan Kehadiran</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ditemukan riwayat kehadiran untuk filter ini. Silakan lakukan absensi terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((att) => {
            const isLate = att.status === "TERLAMBAT";
            return (
              <div
                key={att.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {att.checkInPhoto ? (
                    <img
                      src={att.checkInPhoto}
                      alt={att.worker.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muh-navy bg-muh-light px-2 py-0.5 rounded">
                        {att.worker.workerCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{att.worker.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLate
                            ? "bg-amber-100 text-amber-800"
                            : att.status === "HADIR"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span>{att.worker.jobType}</span> •{" "}
                      <span className="font-medium text-slate-700">
                        {att.worker.assignments?.[0]?.project?.projectName || "Proyek SMKS Muhammadiyah 2"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatIndonesianDate(att.workDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 gap-1 text-xs">
                  <div className="flex items-center gap-1 text-slate-700 font-mono">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Masuk: {att.checkInAt ? new Date(att.checkInAt).toLocaleTimeString("id-ID") : "-"}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-muh-blue" />
                    <span>Pulang: {att.checkOutAt ? new Date(att.checkOutAt).toLocaleTimeString("id-ID") : "Belum"}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    <span>{att.checkInVerifiedBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
