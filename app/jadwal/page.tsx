"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, Save, ShieldCheck } from "lucide-react";

export default function JadwalPage() {
  const [schedule, setSchedule] = useState({
    id: "",
    name: "Jadwal Standar Proyek SMKS Muh 2 Genteng",
    startTime: "07:00",
    endTime: "16:00",
    gracePeriod: 15,
    workDays: "1,2,3,4,5,6",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data.schedules && data.schedules.length > 0) {
          setSchedule(data.schedules[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan jadwal.");
      } else {
        setMessage("Pengaturan jadwal kerja dan toleransi berhasil diperbarui!");
      }
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pengaturan Jam & Jadwal Kerja</h1>
        <p className="text-xs text-slate-500">
          Atur jam masuk resmi, batas toleransi keterlambatan, dan jam kepulangan tukang di SMKS Muhammadiyah 2 Genteng.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Konfigurasi Jadwal</label>
          <input
            type="text"
            required
            value={schedule.name}
            onChange={(e) => setSchedule({ ...schedule, name: e.target.value })}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-muh-blue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muh-blue" />
              <span>Jam Masuk Resmi (WIB)</span>
            </label>
            <input
              type="time"
              required
              value={schedule.startTime}
              onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-muh-blue"
            />
            <p className="text-[10px] text-slate-400 mt-1">Standar sekolah: 07:00 WIB</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muh-darkblue" />
              <span>Jam Pulang Kerja (WIB)</span>
            </label>
            <input
              type="time"
              required
              value={schedule.endTime}
              onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-muh-blue"
            />
            <p className="text-[10px] text-slate-400 mt-1">Standar kepulangan: 16:00 WIB</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Batas Toleransi Keterlambatan (Menit)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="60"
              required
              value={schedule.gracePeriod}
              onChange={(e) => setSchedule({ ...schedule, gracePeriod: parseInt(e.target.value, 10) || 0 })}
              className="w-32 p-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-muh-blue"
            />
            <span className="text-xs text-slate-500 font-medium">Menit setelah jam masuk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Tukang yang melakukan absen sebelum <strong>07:{schedule.gracePeriod.toString().padStart(2, "0")} WIB</strong>{" "}
            akan otomatis berstatus <span className="text-emerald-600 font-bold">HADIR (TEPAT WAKTU)</span>. Melewati
            waktu tersebut dinyatakan <span className="text-amber-600 font-bold">TERLAMBAT</span>.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-muh-teal" />
            <span>Server Time Asia/Jakarta (WIB)</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-5 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-muh-teal" />
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan Jadwal"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
