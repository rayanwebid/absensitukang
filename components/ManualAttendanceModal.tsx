"use client";

import { useState, useEffect } from "react";
import { UserCheck, AlertTriangle, ShieldCheck, X, HardHat } from "lucide-react";
import { ReceiptData } from "./ReceiptModal";

interface WorkerItem {
  id: string;
  workerCode: string;
  name: string;
  jobType: string;
  status: string;
}

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: ReceiptData) => void;
}

export default function ManualAttendanceModal({ isOpen, onClose, onSuccess }: ManualAttendanceModalProps) {
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [eventType, setEventType] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/workers?status=ACTIVE")
        .then((res) => res.json())
        .then((data) => {
          if (data.workers) setWorkers(data.workers);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedWorkerId) {
      setError("Pilih tukang terlebih dahulu.");
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError("Alasan manual absensi wajib diisi secara jelas (minimal 5 karakter).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/attendance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          isManualOverride: true,
          manualWorkerId: selectedWorkerId,
          manualReason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memproses absensi manual.");
        setLoading(false);
        return;
      }

      onSuccess(data.receipt);
      onClose();
    } catch (err: any) {
      setError("Gagal terhubung ke server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Absensi Manual Pengawas</h3>
              <p className="text-xs text-amber-100">Jalur Pengecualian & Verifikasi Lapangan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Event Type Toggle */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Jenis Absensi</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventType("CHECK_IN")}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  eventType === "CHECK_IN"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Absen Masuk
              </button>
              <button
                type="button"
                onClick={() => setEventType("CHECK_OUT")}
                className={`py-2 px-3 rounded-xl font-bold transition-all ${
                  eventType === "CHECK_OUT"
                    ? "bg-muh-navy text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Absen Pulang
              </button>
            </div>
          </div>

          {/* Select Worker */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Pilih Tukang</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">-- Pilih Nama Tukang --</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workerCode} - {w.name} ({w.jobType})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Alasan Verifikasi Manual <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: HP tukang kehabisan baterai, lensa kamera retak, atau luka perban pada dahi."
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              *Tindakan manual akan dicatat dalam Audit Log resmi dengan nama pengawas Anda.
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Konfirmasi Absen Manual"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
