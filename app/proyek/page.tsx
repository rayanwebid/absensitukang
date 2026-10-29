"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Users, Plus, HardHat, Calendar, CheckCircle2, Clock, X } from "lucide-react";

export default function ProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New project modal
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error("Load projects error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, location, description, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal membuat proyek.");
      } else {
        setModalOpen(false);
        setProjectName("");
        setLocation("");
        setDescription("");
        fetchProjects();
      }
    } catch (e: any) {
      alert("Koneksi gagal: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Proyek & Penugasan Lapangan</h1>
          <p className="text-xs text-slate-500">
            Daftar proyek konstruksi dan perbaikan fasilitas di lingkungan SMKS Muhammadiyah 2 Genteng.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-muh-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4 text-muh-teal" />
          <span>+ Tambah Proyek Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Memuat data proyek...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Proyek</h3>
          <p className="text-xs text-slate-400 mt-1">Tambahkan proyek baru untuk mengelompokkan kehadiran tukang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const inProgress = p.status === "IN_PROGRESS";
            const completed = p.status === "COMPLETED";

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        completed
                          ? "bg-emerald-100 text-emerald-800"
                          : inProgress
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {completed ? "Selesai" : inProgress ? "Sedang Berjalan" : "Rencana"}
                    </span>

                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muh-teal" />
                      <span>{p.assignments?.length || 0} Tukang</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.projectName}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description || "Tanpa deskripsi."}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Dimulai: {new Date(p.startDate).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>

                  {/* List Assigned Workers */}
                  {p.assignments && p.assignments.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Tukang Ditugaskan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.assignments.map((a: any) => (
                          <span
                            key={a.id}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <HardHat className="w-3 h-3 text-muh-gold" />
                            <span>{a.worker.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-muh-navy text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Tambah Proyek Konstruksi</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Proyek / Pekerjaan</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Contoh: Renovasi Gedung Parkir Siswa"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi di Sekolah</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Halaman Belakang Gedung C SMKS Muh 2"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Proyek</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="IN_PROGRESS">Sedang Berjalan (In Progress)</option>
                  <option value="PLANNING">Perencanaan (Planning)</option>
                  <option value="COMPLETED">Selesai (Completed)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Proyek</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan ringkas pekerjaan konstruksi..."
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
                  {submitting ? "Menyimpan..." : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
