"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, History, Calendar, User, Search, FileText } from "lucide-react";
import { formatIndonesianDate } from "@/lib/time";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) => {
    const term = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(term) ||
      l.actorName.toLowerCase().includes(term) ||
      (l.entityType && l.entityType.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Audit Log & Jejak Aktivitas</h1>
        <p className="text-xs text-slate-500">
          Catatan tidak dapat diubah (immutable trail) dari seluruh tindakan administratif dan verifikasi biometrik.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aksi (LOGIN, CREATE_WORKER, FACE_REGISTRATION...), nama aktor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muh-blue"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-muh-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Memuat audit log...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 p-6">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Log Tercatat</h3>
            <p className="text-xs text-slate-400 mt-1">Aktivitas administratif akan otomatis tercatat di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Waktu (WIB)</th>
                  <th className="py-3.5 px-4">Aktor / Petugas</th>
                  <th className="py-3.5 px-4">Tindakan (Action)</th>
                  <th className="py-3.5 px-4">Entitas</th>
                  <th className="py-3.5 px-4">Detail Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{log.actorName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-mono font-bold bg-muh-light text-muh-navy px-2 py-0.5 rounded border border-muh-teal/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.entityType}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px] font-mono text-slate-600">
                      {log.metadata || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
