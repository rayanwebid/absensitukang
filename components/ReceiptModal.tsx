"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Clock, MapPin, User, HardHat, ShieldCheck, Download, X, Calendar } from "lucide-react";

export interface ReceiptData {
  id: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  jobType: string;
  projectName: string;
  projectRole: string;
  eventType: "CHECK_IN" | "CHECK_OUT";
  workDate: string;
  serverTime: string;
  status: string;
  statusNote: string;
  verificationMethod: string;
  distanceScore?: number | null;
  photoSnapshot?: string | null;
}

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  useEffect(() => {
    if (receipt) {
      // Fire confetti burst
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#05BFDB", "#10B981", "#F5A623", "#088395"],
      });
    }
  }, [receipt]);

  if (!receipt) return null;

  const isCheckIn = receipt.eventType === "CHECK_IN";
  const isLate = receipt.status === "TERLAMBAT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
        {/* Header Header Pattern */}
        <div
          className={`p-6 text-white text-center relative ${
            isLate
              ? "bg-gradient-to-br from-amber-600 to-amber-700"
              : isCheckIn
              ? "bg-gradient-to-br from-emerald-600 to-teal-700"
              : "bg-gradient-to-br from-muh-blue to-muh-navy"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-wide uppercase">
            {isCheckIn ? "Absensi Masuk Berhasil" : "Absensi Pulang Berhasil"}
          </h3>
          <p className="text-xs text-white/90 mt-1 font-medium">SMKS MUHAMMADIYAH 2 GENTENG</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/25 border border-white/40">
            <span>
              {isLate ? "⚠️ TERLAMBAT" : isCheckIn ? "✅ HADIR TEPAT WAKTU" : "🏁 SELESAI KERJA"}
            </span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          {/* Worker Snapshot & Details */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            {receipt.photoSnapshot ? (
              <img
                src={receipt.photoSnapshot}
                alt="Wajah Absensi"
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-muh-darkblue bg-muh-light px-2 py-0.5 rounded-md inline-block mb-1">
                {receipt.workerCode}
              </span>
              <h4 className="text-base font-bold text-slate-900 truncate">{receipt.workerName}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-muh-gold" />
                <span>{receipt.jobType}</span>
              </p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal
              </span>
              <span className="font-semibold text-slate-800">{receipt.workDate}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Waktu Server (WIB)
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">{receipt.serverTime} WIB</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Penugasan
              </span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                {receipt.projectName}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Verifikasi
              </span>
              <span className="font-semibold text-emerald-700">{receipt.verificationMethod}</span>
            </div>

            {receipt.statusNote && (
              <div className="p-2.5 rounded-xl bg-slate-100/70 text-slate-600 text-[11px]">
                <span className="font-bold text-slate-700">Catatan: </span>
                {receipt.statusNote}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Selesai / Lanjut
            </button>
            <button
              onClick={() => window.print()}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
