"use client";

import { useState } from "react";
import CameraFaceScanner from "@/components/CameraFaceScanner";
import ManualAttendanceModal from "@/components/ManualAttendanceModal";
import ReceiptModal, { ReceiptData } from "@/components/ReceiptModal";
import Link from "next/link";
import { History, ShieldAlert, Sparkles, Building2, CheckCircle, Clock } from "lucide-react";

export default function AbsensiPage() {
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualReceipt, setManualReceipt] = useState<ReceiptData | null>(null);

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-muh-navy via-muh-blue to-muh-darkblue text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-muh-teal/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muh-teal/20 text-muh-teal text-[10px] font-bold tracking-wide uppercase border border-muh-teal/30">
              <Sparkles className="w-3 h-3" />
              <span>Face Biometrics V1 • SMKS Muh 2 Genteng</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Presensi Wajah Tukang</h1>
            <p className="text-xs text-slate-200">
              Absensi mandiri menggunakan kamera HP dengan verifikasi liveness anti-foto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/absensi/riwayat"
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <History className="w-4 h-4 text-muh-teal" />
              <span>Riwayat</span>
            </Link>

            <button
              onClick={() => setManualModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-400/30"
              title="Absensi manual jika kamera HP bermasalah"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Manual Pengawas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Face Recognition Camera Scanner */}
      <CameraFaceScanner />

      {/* Bottom Information & Operational Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Aturan Jam Masuk</div>
            <div className="text-[11px] text-slate-500">Masuk: 07.00 WIB (Toleransi 15 menit)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muh-light text-muh-darkblue flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">SMKS Muhammadiyah 2 Genteng</div>
            <div className="text-[11px] text-slate-500">Pembangunan & Pemeliharaan Fasilitas Kampus</div>
          </div>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSuccess={(receipt) => setManualReceipt(receipt)}
      />

      {/* Receipt Modal for Manual Attendance */}
      {manualReceipt && <ReceiptModal receipt={manualReceipt} onClose={() => setManualReceipt(null)} />}
    </div>
  );
}
