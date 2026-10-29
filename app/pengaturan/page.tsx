"use client";

import { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle2, ShieldCheck, Building2, SlidersHorizontal, Lock } from "lucide-react";

export default function PengaturanPage() {
  const [settings, setSettings] = useState({
    school_name: "SMKS Muhammadiyah 2 Genteng",
    school_address:
      "Jl. Hasanudin No. 103, Dusun Krajan, Genteng Wetan, Kec. Genteng, Kab. Banyuwangi, Jawa Timur 68465",
    school_phone: "(0333) 845214",
    face_match_threshold: "0.55",
    liveness_mode: "ACTIVE_CHALLENGE",
    allow_manual_override: "true",
    data_retention_days: "180",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
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
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan pengaturan.");
      } else {
        setMessage("Pengaturan sistem dan parameter biometrik berhasil disimpan!");
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
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Konfigurasi Sistem & Biometrik</h1>
        <p className="text-xs text-slate-500">
          Atur parameter kecerdasan buatan pengenalan wajah, identitas sekolah, dan kepatuhan privasi data.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Profil Sekolah */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muh-blue" />
            <span>Identitas Sekolah & Unit Proyek</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Institusi</label>
              <input
                type="text"
                value={settings.school_name}
                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Proyek</label>
              <textarea
                rows={2}
                value={settings.school_address}
                onChange={(e) => setSettings({ ...settings, school_address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={settings.school_phone}
                onChange={(e) => setSettings({ ...settings, school_phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Parameter Kecerdasan Buatan (Biometric AI) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muh-teal" />
            <span>Parameter Biometrik & Anti-Spoofing</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Ambang Batas Jarak Euclidean (Threshold)</label>
                <span className="font-mono font-bold text-muh-navy text-sm">{settings.face_match_threshold}</span>
              </div>
              <input
                type="range"
                min="0.45"
                max="0.65"
                step="0.01"
                value={settings.face_match_threshold}
                onChange={(e) => setSettings({ ...settings, face_match_threshold: e.target.value })}
                className="w-full accent-muh-navy cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.45 (Lebih Ketat)</span>
                <span>0.55 (Standar Optimal)</span>
                <span>0.65 (Lebih Toleran)</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mode Deteksi Liveness (Anti-Spoofing)</label>
              <select
                value={settings.liveness_mode}
                onChange={(e) => setSettings({ ...settings, liveness_mode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              >
                <option value="ACTIVE_CHALLENGE">Tantangan Aktif Interaktif (Kedip Mata / Senyum)</option>
                <option value="PASSIVE">Deteksi Pasif (Landmark Real-time)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Mode tantangan aktif mencegah pemalsuan menggunakan foto cetak atau video dari HP lain.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Retensi Data Biometrik (Hari)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.data_retention_days}
                onChange={(e) => setSettings({ ...settings, data_retention_days: e.target.value })}
                className="w-32 p-2.5 rounded-xl border border-slate-300 font-medium font-mono"
              />
              <span className="text-[11px] text-slate-500 ml-2">Hari masa simpan foto snapshot</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-6 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-muh-teal" />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
