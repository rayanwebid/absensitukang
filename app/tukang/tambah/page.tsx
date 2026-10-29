"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Phone,
  Briefcase,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { loadFaceApi } from "@/lib/faceApiLoader";

export default function TambahTukangPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobType, setJobType] = useState("Tukang Batu & Pondasi");
  const [projectId, setProjectId] = useState("");
  const [projectRole, setProjectRole] = useState("Tukang Utama");
  const [notes, setNotes] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Camera & Face states
  const [projects, setProjects] = useState<any[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedVector, setCapturedVector] = useState<number[] | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState("Kamera belum aktif");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) {
          setProjects(data.projects);
          if (data.projects.length > 0) setProjectId(data.projects[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const startCamera = async () => {
    setError(null);
    setFaceStatus("Menyiapkan kecerdasan buatan...");
    try {
      await loadFaceApi();
      setModelsLoaded(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setFaceStatus("Posisikan wajah menghadap lurus ke kamera, lalu klik 'Ambil Sampel Wajah'.");
        };
      }
    } catch (err: any) {
      setFaceStatus("Gagal membuka kamera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCaptureFace = async () => {
    if (!videoRef.current) return;
    setFaceStatus("Menganalisis wajah biometrik...");

    try {
      const faceapi = await loadFaceApi();
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceStatus("Wajah tidak terdeteksi jelas. Pastikan pencahayaan cukup dan wajah di tengah bingkai.");
        return;
      }

      // Snapshot image
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        setCapturedSnapshot(canvas.toDataURL("image/jpeg", 0.8));
      }

      const vec: number[] = Array.from(detection.descriptor).map(Number);
      setCapturedVector(vec);
      setFaceStatus("Template biometrik 128-dimensi berhasil diekstrak dengan akurasi tinggi!");
    } catch (e: any) {
      setFaceStatus("Kesalahan: " + e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama tukang wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          jobType,
          projectId: projectId || null,
          projectRole,
          notes,
          faceEmbedding: capturedVector,
          samplePhoto: capturedSnapshot,
          consentAgreed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan tukang baru.");
        setLoading(false);
        return;
      }

      alert("Tukang berhasil didaftarkan ke sistem!");
      router.push("/tukang");
    } catch (err: any) {
      setError("Koneksi gagal: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/tukang"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pendaftaran Tukang Baru</h1>
          <p className="text-xs text-slate-500">
            Registrasi identitas pekerja dan template biometrik wajah SMKS Muhammadiyah 2 Genteng.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Data Identitas Pekerja */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-muh-gold" />
            <span>1. Informasi Identitas Tukang</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                Nama Lengkap Tukang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bpk. Joko Supriyadi"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                Keahlian / Jenis Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-muh-blue"
              >
                <option value="Tukang Batu & Pondasi">Tukang Batu & Pondasi</option>
                <option value="Tukang Kayu & Plafon">Tukang Kayu & Plafon</option>
                <option value="Tukang Besi & Las">Tukang Besi & Las</option>
                <option value="Tukang Cat & Finishing">Tukang Cat & Finishing</option>
                <option value="Kenek / Pembantu Tukang">Kenek / Pembantu Tukang</option>
                <option value="Mandor Lapangan">Mandor Lapangan</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Penugasan Proyek</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-muh-blue"
              >
                <option value="">-- Tanpa Proyek Spesifik --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1.5">Catatan Khusus (Opsional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Spesialis pasang keramik granit dan plesteran dinding halus."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
            />
          </div>
        </div>

        {/* Card 2: Registrasi Biometrik Wajah */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-muh-teal" />
              <span>2. Registrasi Biometrik Wajah Kamera HP</span>
            </h2>
            {capturedVector && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Wajah Siap</span>
              </span>
            )}
          </div>

          {!cameraActive ? (
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-muh-light flex items-center justify-center text-muh-darkblue">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Buka kamera untuk mengambil foto dan mengekstrak template biometrik wajah tukang secara otomatis.
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="py-2.5 px-4 rounded-xl bg-muh-blue hover:bg-muh-darkblue text-white font-bold text-xs shadow-md transition-colors"
              >
                Aktifkan Kamera Registrasi
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-muh-navy">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                {/* Oval Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-52 h-64 rounded-[50%] border-4 transition-colors ${
                      capturedVector ? "border-emerald-400" : "border-white/60 border-dashed"
                    }`}
                  ></div>
                </div>

                {capturedSnapshot && (
                  <div className="absolute top-3 right-3 border-2 border-emerald-400 rounded-xl overflow-hidden shadow-lg w-20 h-20">
                    <img src={capturedSnapshot} alt="Snapshot Wajah" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-700 font-medium">
                {faceStatus}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCaptureFace}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-muh-teal hover:bg-cyan-400 text-muh-navy font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Sampel Wajah</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                >
                  Tutup Kamera
                </button>
              </div>
            </div>
          )}

          {/* PDP Consent Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                className="mt-0.5 rounded text-muh-blue focus:ring-muh-blue w-4 h-4"
              />
              <span className="text-slate-600 leading-relaxed text-[11px]">
                <strong className="text-slate-800">Persetujuan Subjek Data (UU PDP No. 27 Tahun 2022):</strong> Pekerja
                telah diberikan penjelasan mengenai tujuan pemrosesan data biometrik untuk presensi kerja di SMKS
                Muhammadiyah 2 Genteng dan memberikan persetujuan eksplisit.
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link
            href="/tukang"
            className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan Data..." : "Simpan & Daftarkan Tukang"}
          </button>
        </div>
      </form>
    </div>
  );
}
