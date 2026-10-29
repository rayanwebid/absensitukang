import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AttendanceReportRow {
  Tanggal: string;
  "Kode Tukang": string;
  "Nama Lengkap": string;
  Keahlian: string;
  Proyek: string;
  "Jam Masuk": string;
  "Jam Pulang": string;
  Status: string;
  "Metode Verifikasi": string;
  Keterangan: string;
}

/**
 * Ekspor data absensi ke format Microsoft Excel (.xlsx)
 */
export function exportAttendanceToExcel(data: AttendanceReportRow[], filename = "Rekap_Absensi_Tukang_SMKS_Muh2.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-width column calculation
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => (row[key as keyof AttendanceReportRow] ? String(row[key as keyof AttendanceReportRow]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Absensi Tukang");
  XLSX.writeFile(workbook, filename);
}

/**
 * Ekspor data absensi ke format PDF resmi bertanda tangan sekolah
 */
export function exportAttendanceToPdf(
  headers: string[],
  rows: (string | number)[][],
  title = "REKAP KEHADIRAN TUKANG SMKS MUHAMMADIYAH 2 GENTENG",
  subtitle = "Periode Absensi Kerja Lapangan",
  filename = "Laporan_Absensi_SMKS_Muh2.pdf"
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header Sekolah
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SMKS MUHAMMADIYAH 2 GENTENG", 148, 14, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Jl. Hasanudin No. 103, Genteng, Banyuwangi, Jawa Timur | Telp: (0333) 845214", 148, 20, { align: "center" });

  // Garis Pembatas Kop Surat
  doc.setLineWidth(0.5);
  doc.line(15, 23, 282, 23);

  // Judul Dokumen
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 148, 30, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(subtitle, 148, 35, { align: "center" });

  // Tabel Autotable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 40,
    theme: "grid",
    headStyles: {
      fillColor: [10, 77, 104], // Navy-blue SMKS Muh
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [245, 248, 250],
    },
    margin: { left: 15, right: 15 },
  });

  // Footer / Tanda tangan
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 150;
  if (finalY + 35 < 200) {
    const signY = finalY + 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Genteng, " + new Date().toLocaleDateString("id-ID", { dateStyle: "long" }), 230, signY);
    doc.text("Pengawas / Mandor Lapangan,", 230, signY + 5);
    doc.text("( Ir. Joko Susanto )", 230, signY + 25);
  }

  doc.save(filename);
}

/**
 * Ekspor ke CSV dengan UTF-8 BOM
 */
export function exportAttendanceToCsv(data: AttendanceReportRow[], filename = "Rekap_Absensi_Tukang.csv") {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = String(row[header as keyof AttendanceReportRow] || "").replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
