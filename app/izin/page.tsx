"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, XCircle, Clock, Calendar, User, AlertCircle, X } from "lucide-react";

export default function IzinPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [workerId, setWorkerId] = useState("");
  const [leaveType, setLeaveType] = useState("IZIN");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leave");
      const data = await res.json();
      if (data.leaveRequests) setRequests(data.leaveRequests);
    } catch (e) {
      console.error("Load leave error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetch("/api/workers?status=ACTIVE")
      .then((res) => res.json())
      .then((data) => {
        if (data.workers) setWorkers(data.workers);
      })
      .catch(() => {});
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, leaveType, startDate, endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mengajukan izin.");
      } else {
        setModalOpen(false);
        setReason("");
        fetchLeaveRequests();
      }
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (id: string, approvalStatus: "APPROVED" | "REJECTED") => {
    const notes = prompt(`Masukkan catatan ${approvalStatus === "APPROVED" ? "persetujuan" : "penolakan"}:`);
    if (notes === null) return;

    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approvalStatus, approvalNotes: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal memproses permohonan.");
      } else {
        fetchLeaveRequests();
      }
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pengajuan Izin & Sakit</h1>
          <p className="text-xs text-slate-500">
            Pencatatan ketidakhadiran resmi dan alur persetujuan mandor/pengawas SMKS Muhammadiyah 2 Genteng.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4 text-muh-teal" />
          <span>+ Buat Permohonan Izin</span>
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Memuat data permohonan...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Pengajuan Izin</h3>
          <p className="text-xs text-slate-400 mt-1">Semua tukang aktif bekerja atau belum mengajukan izin/sakit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const isApproved = r.approvalStatus === "APPROVED";
            const isRejected = r.approvalStatus === "REJECTED";
            const isPending = r.approvalStatus === "PENDING";

            return (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      r.leaveType === "SAKIT" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {r.leaveType === "SAKIT" ? "🚑" : "📋"}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muh-navy bg-slate-100 px-2 py-0.5 rounded">
                        {r.worker.workerCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{r.worker.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.leaveType === "SAKIT" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {r.leaveType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">"{r.reason}"</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(r.startDate).toLocaleDateString("id-ID")} s/d{" "}
                        {new Date(r.endDate).toLocaleDateString("id-ID")}
                      </span>
                      {r.approvedBy && <span>• Disetujui oleh: {r.approvedBy}</span>}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveReject(r.id, "APPROVED")}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => handleApproveReject(r.id, "REJECTED")}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isApproved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isApproved ? "✓ Disetujui" : "✗ Ditolak"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-muh-navy text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Form Permohonan Izin / Sakit</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Tukang</label>
                <select
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-muh-blue"
                >
                  <option value="">-- Pilih Tukang --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.workerCode} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Ketidakhadiran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType("IZIN")}
                    className={`py-2 rounded-xl font-bold ${
                      leaveType === "IZIN" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Izin Keperluan
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType("SAKIT")}
                    className={`py-2 rounded-xl font-bold ${
                      leaveType === "SAKIT" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Sakit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan alasan izin / sakit..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
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
                  {submitting ? "Mengirim..." : "Kirim Permohonan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
