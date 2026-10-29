"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  ScanFace,
  Phone,
  HardHat,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  X,
  Camera,
  Calendar,
} from "lucide-react";
import { loadFaceApi } from "@/lib/faceApiLoader";

interface WorkerData {
  id: string;
  workerCode: string;
  name: string;
  phone: string | null;
  jobType: string;
  status: string;
  startDate: string;
  notes: string | null;
  hasFaceRegistered: boolean;
  assignedProject: { projectName: string } | null;
  projectRole: string;
  todayAttendance: {
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  } | null;
}

export default function TukangPage() {
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJob, setFilterJob] = useState("ALL");

  // Face Registration Modal for existing worker
  const [faceModalWorker, setFaceModalWorker] = useState<WorkerData | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [faceStatus, setFaceStatus] = useState<string>("Siapkan kamera...");
  const [capturedVector, setCapturedVector] = useState<number[] | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [savingFace, setSavingFace] = useState(false);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workers");
      const data = await res.json();
      if (data.workers) setWorkers(data.workers);
    } catch (e) {
      console.error("Fetch workers error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const filtered = workers.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(search.toLowerCase()) ||
      w.jobType.toLowerCase().includes(search.toLowerCase());
    const matchJob = filterJob === "ALL" || w.jobType === filterJob;
    return matchSearch && matchJob;
  });

  // Open Face Register Modal
  const openFaceModal = async (worker: WorkerData) => {
    setFaceModalWorker(worker);
    setCapturedVector(null);
    setCapturedSnapshot(null);
    setFaceStatus("Membuka kamera...");

    try {
      await loadFaceApi();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setVideoStream(stream);
      setFaceStatus("Posisikan wajah tepat di tengah kamera dan klik Ambil Wajah.");
    } catch (err: any) {
      setFaceStatus("Gagal membuka kamera: " + err.message);
    }
  };

  const closeFaceModal = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
    setFaceModalWorker(null);
    setCapturedVector(null);
    setCapturedSnapshot(null);
  };

  const handleCaptureFace = async () => {
    const videoEl = document.getElementById("modal-face-video") as HTMLVideoElement;
    if (!videoEl) return;

    setFaceStatus("Menganalisis wajah biometrik...");
    try {
      const faceapi = await loadFaceApi();
      const detection = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setFaceStatus("Wajah tidak terdeteksi jelas. Pastikan pencahayaan cukup dan wajah menghadap lurus.");
        return;
      }

      // Snapshot
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, 300, 300);
        setCapturedSnapshot(canvas.toDataURL("image/jpeg", 0.8));
      }

      const vec: number[] = Array.from(detection.descriptor).map(Number);
      setCapturedVector(vec);
      setFaceStatus("Wajah berhasil ditangkap! Klik 'Simpan Biometrik' untuk mengonfirmasi.");
    } catch (e: any) {
      setFaceStatus("Terjadi kesalahan: " + e.message);
    }
  };

  const handleSaveFaceProfile = async () => {
    if (!faceModalWorker || !capturedVector) return;

    setSavingFace(true);
    try {
      const res = await fetch(`/api/workers/${faceModalWorker.id}/face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embedding: capturedVector,
          samplePhoto: capturedSnapshot,
          consentAgreed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menyimpan biometrik wajah.");
        setSavingFace(false);
        return;
      }

      alert("Biometrik wajah berhasil didaftarkan!");
      closeFaceModal();
      fetchWorkers();
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    } finally {
      setSavingFace(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Data Tukang & Pekerja Lapangan
          </h1>
          <p className="text-xs text-slate-500">
            Kelola identitas, penugasan proyek, dan status biometrik wajah pekerja SMKS Muhammadiyah 2 Genteng.
          </p>
        </div>

        <Link
          href="/tukang/tambah"
          className="py-2.5 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <UserPlus className="w-4 h-4 text-muh-teal" />
          <span>+ Tambah Tukang Baru</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, kode (TKG-...), atau keahlian..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
          />
        </div>

        <select
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white focus:outline-none"
        >
          <option value="ALL">Semua Keahlian</option>
          <option value="Tukang Batu & Pondasi">Tukang Batu & Pondasi</option>
          <option value="Tukang Kayu & Plafon">Tukang Kayu & Plafon</option>
          <option value="Tukang Besi & Las">Tukang Besi & Las</option>
          <option value="Tukang Cat & Finishing">Tukang Cat & Finishing</option>
          <option value="Kenek / Pembantu Tukang">Kenek / Pembantu Tukang</option>
          <option value="Mandor Lapangan">Mandor Lapangan</option>
        </select>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Memuat data tukang...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak Ada Data Tukang</h3>
          <p className="text-xs text-slate-400 mt-1">Gunakan tombol Tambah Tukang Baru untuk mendaftarkan pekerja.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-muh-light border border-muh-teal/30 flex items-center justify-center font-bold text-muh-navy text-sm shadow-inner">
                      <HardHat className="w-6 h-6 text-muh-darkblue" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-muh-navy bg-slate-100 px-2 py-0.5 rounded">
                        {w.workerCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{w.name}</h3>
                      <p className="text-[11px] text-slate-500">{w.jobType}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      w.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {w.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{w.assignedProject?.projectName || "Umum / Tanpa Proyek"}</span>
                  </div>

                  {w.phone && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{w.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Mulai: {new Date(w.startDate).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                {/* Face Biometric Status Badge */}
                <div className="pt-2 flex items-center justify-between">
                  {w.hasFaceRegistered ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Wajah Terdaftar</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Belum Registrasi Wajah</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => openFaceModal(w)}
                  className="flex-1 py-2 px-3 rounded-xl bg-muh-light hover:bg-cyan-100 text-muh-navy font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ScanFace className="w-3.5 h-3.5 text-muh-darkblue" />
                  <span>{w.hasFaceRegistered ? "Update Wajah" : "Daftarkan Wajah"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Face Registration Modal */}
      {faceModalWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-muh-navy text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Registrasi Biometrik Wajah</h3>
                <p className="text-xs text-muh-teal">
                  {faceModalWorker.name} ({faceModalWorker.workerCode})
                </p>
              </div>
              <button onClick={closeFaceModal} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Video Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-muh-blue">
                <video
                  id="modal-face-video"
                  autoPlay
                  playsInline
                  muted
                  ref={(el) => {
                    if (el && videoStream) {
                      el.srcObject = videoStream;
                    }
                  }}
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Face Oval overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-muh-teal/70"></div>
                </div>

                {capturedSnapshot && (
                  <div className="absolute top-2 right-2 border-2 border-emerald-400 rounded-xl overflow-hidden shadow-lg w-20 h-20">
                    <img src={capturedSnapshot} alt="Wajah" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-center font-medium">
                {faceStatus}
              </div>

              {/* Legal PDP Consent Disclaimer */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[10px] text-blue-900 leading-relaxed">
                <span className="font-bold">Klausul Persetujuan Biometrik: </span>
                Data biometrik berupa template vektor 128-dimensi diproses secara aman untuk keperluan absensi kerja di
                SMKS Muhammadiyah 2 Genteng sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP).
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCaptureFace}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-muh-blue hover:bg-muh-darkblue text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Wajah</span>
                </button>

                {capturedVector && (
                  <button
                    type="button"
                    onClick={handleSaveFaceProfile}
                    disabled={savingFace}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingFace ? "Menyimpan..." : "Simpan Biometrik"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
