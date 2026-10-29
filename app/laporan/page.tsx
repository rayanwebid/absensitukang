"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  Printer,
  FileDown,
  Building,
} from "lucide-react";
import {
  exportAttendanceToExcel,
  exportAttendanceToPdf,
  exportAttendanceToCsv,
  AttendanceReportRow,
} from "@/lib/export";
import { formatIndonesianDate } from "@/lib/time";

export default function LaporanPage() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let url = "/api/attendance/history?limit=300";
      if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
      if (selectedWorkerId !== "ALL") url += `&workerId=${selectedWorkerId}`;
      if (selectedStatus !== "ALL") url += `&status=${selectedStatus}`;
      if (selectedProjectId !== "ALL") url += `&projectId=${selectedProjectId}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.attendances) setAttendances(data.attendances);
    } catch (e) {
      console.error("Report load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
    fetch("/api/workers")
      .then((res) => res.json())
      .then((data) => {
        if (data.workers) setWorkers(data.workers);
      })
      .catch(() => {});

    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch(() => {});
  }, [startDate, endDate, selectedWorkerId, selectedStatus, selectedProjectId]);

  // Convert to exportable format
  const getExportRows = (): AttendanceReportRow[] => {
    return attendances.map((a) => {
      const checkInStr = a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString("id-ID") + " WIB" : "-";
      const checkOutStr = a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString("id-ID") + " WIB" : "-";
      const proj = a.worker.assignments?.[0]?.project?.projectName || "Umum / Tanpa Proyek";

      return {
        Tanggal: a.workDate,
        "Kode Tukang": a.worker.workerCode,
        "Nama Lengkap": a.worker.name,
        Keahlian: a.worker.jobType,
        Proyek: proj,
        "Jam Masuk": checkInStr,
        "Jam Pulang": checkOutStr,
        Status: a.status,
        "Metode Verifikasi": a.checkInVerifiedBy,
        Keterangan: a.notes || "-",
      };
    });
  };

  const handleExportExcel = () => {
    const rows = getExportRows();
    if (rows.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    exportAttendanceToExcel(rows, `Rekap_Absensi_Tukang_${startDate || "Semua"}.xlsx`);
  };

  const handleExportPdf = () => {
    const rows = getExportRows();
    if (rows.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = [
      "Tanggal",
      "Kode",
      "Nama Tukang",
      "Keahlian",
      "Proyek",
      "Masuk",
      "Pulang",
      "Status",
      "Keterangan",
    ];
    const body = rows.map((r) => [
      r.Tanggal,
      r["Kode Tukang"],
      r["Nama Lengkap"],
      r.Keahlian,
      r.Proyek,
      r["Jam Masuk"],
      r["Jam Pulang"],
      r.Status,
      r.Keterangan,
    ]);

    exportAttendanceToPdf(
      headers,
      body,
      "REKAP PRESENSI TUKANG - SMKS MUHAMMADIYAH 2 GENTENG",
      `Periode: ${startDate || "Awal"} s/d ${endDate || "Sekarang"}`
    );
  };

  const handleExportCsv = () => {
    const rows = getExportRows();
    if (rows.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    exportAttendanceToCsv(rows, `Rekap_Absensi_Tukang_${startDate || "Semua"}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laporan & Rekap Kehadiran
          </h1>
          <p className="text-xs text-slate-500">
            Penyaringan, kalkulasi kehadiran, dan ekspor data resmi ke format Excel, PDF, dan CSV.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="py-2 px-3.5 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4 text-muh-teal" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
          >
            <FileDown className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Filter className="w-4 h-4 text-muh-teal" />
          <span>Filter Laporan Kehadiran</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Pilih Tukang</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="ALL">Semua Tukang</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workerCode} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Status Kehadiran</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">Hadir Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Proyek Penugasan</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="ALL">Semua Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Ditemukan <strong>{attendances.length}</strong> catatan kehadiran
          </span>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedWorkerId("ALL");
              setSelectedStatus("ALL");
              setSelectedProjectId("ALL");
            }}
            className="text-xs text-muh-blue font-bold hover:underline"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Memuat laporan...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-16 p-6">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Catatan Laporan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter pencarian atau rentang tanggal Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Tukang</th>
                  <th className="py-3.5 px-4">Keahlian</th>
                  <th className="py-3.5 px-4">Proyek</th>
                  <th className="py-3.5 px-4">Jam Masuk</th>
                  <th className="py-3.5 px-4">Jam Pulang</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendances.map((a) => {
                  const isLate = a.status === "TERLAMBAT";
                  const isHadir = a.status === "HADIR";

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium whitespace-nowrap">{a.workDate}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{a.worker.name}</div>
                        <div className="text-[10px] text-slate-400">{a.worker.workerCode}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{a.worker.jobType}</td>
                      <td className="py-3 px-4 max-w-[180px] truncate">
                        {a.worker.assignments?.[0]?.project?.projectName || "Umum"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium whitespace-nowrap text-emerald-700">
                        {a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString("id-ID") + " WIB" : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium whitespace-nowrap text-muh-blue">
                        {a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString("id-ID") + " WIB" : "Belum"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLate
                              ? "bg-amber-100 text-amber-800"
                              : isHadir
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        {a.checkInVerifiedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
