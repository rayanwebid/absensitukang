# 👷 Sistem Absensi Tukang Digital Berbasis Face Recognition
## SMKS Muhammadiyah 2 Genteng

Aplikasi website presensi kehadiran mandiri pekerja/tukang proyek pembangunan dan pemeliharaan fasilitas sekolah di lingkungan **SMKS Muhammadiyah 2 Genteng**, Banyuwangi, Jawa Timur.

Sistem dilengkapi dengan **Kecerdasan Buatan (AI) Pengenalan Wajah**, **Uji Liveness Anti-Spoofing (Kedip Mata / Senyum)**, waktu terpusat server **WIB (Asia/Jakarta)**, dan kepatuhan terhadap **UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (PDP)**.

---

## 🌟 Fitur Utama

1. **Presensi Biometrik Wajah Mandiri via Kamera HP (`/absensi`):**
   - Mendukung kamera depan (selfie) & kamera belakang.
   - Bingkai penuntun oval adaptif dengan scanline laser beam.
   - **Tantangan Liveness Interaktif**: Meminta pekerja mengedipkan mata (*Eye Aspect Ratio / EAR*) atau tersenyum (*Mouth Aspect Ratio / MAR*) untuk mencegah pemalsuan menggunakan foto cetak atau rekaman video layar HP.
   - Peringatan audio instan (synthesizer Web Audio API tanpa file eksternal) untuk feedback suara di lapangan.
   - Cetak bukti / struk konfirmasi kehadiran digital dengan taburan konfeti.

2. **Waktu Resmi Terpusat Server (Asia/Jakarta - WIB):**
   - Waktu absensi divalidasi langsung oleh jam server, bukan jam HP pekerja.
   - Pencegahan absensi ganda (*anti-double check-in/check-out*).
   - Penentuan otomatis status **HADIR (Tepat Waktu)** atau **TERLAMBAT** berdasarkan jadwal dan batas toleransi (contoh: toleransi 15 menit).

3. **Jalur Pengecualian / Absensi Manual Pengawas:**
   - Menyediakan form absensi khusus pengawas lapangan jika kamera HP pekerja rusak atau pekerja mengalami luka/perban pada wajah.
   - Wajib menyertakan alasan tertulis dan tercatat resmi dalam *Audit Log*.

4. **Dashboard Real-time (`/dashboard`):**
   - Statistik 6 metrik utama: Total Tukang, Hadir Tepat Waktu, Terlambat, Izin/Sakit, Belum Absen Masuk, Belum Absen Pulang.
   - Grafik tren kehadiran 7 hari terakhir.
   - *Live activity feed* dengan foto snapshot dan jam kehadiran.
   - Status proyek konstruksi aktif.

5. **Manajemen Data Tukang (`/tukang`):**
   - CRUD data tukang lengkap: Nama, Nomor HP, Jenis Keahlian (Tukang Batu, Kayu, Besi, Cat, Kenek, Mandor), Proyek Penugasan.
   - Registrasi wajah langsung dari kamera HP dengan preview template 128-dimensi.
   - Klausul persetujuan pemrosesan biometrik (UU PDP).

6. **Pengaturan Jadwal Kerja (`/jadwal`):**
   - Konfigurasi jam masuk (07:00 WIB), jam pulang (16:00 WIB), batas toleransi (15 menit), dan hari kerja.

7. **Pengajuan Izin & Sakit (`/izin`):**
   - Formulir permohonan izin/sakit mandiri.
   - Alur persetujuan (*Approve / Reject*) oleh pengawas lapangan.
   - Sinkronisasi otomatis ke status presensi harian.

8. **Proyek Konstruksi & Penugasan (`/proyek`):**
   - Pengelompokan tukang ke proyek spesifik (Workshop Mesin TBSM, Lab Komputer Gedung B, Masjid Asy-Syifa).

9. **Laporan & Rekap Kehadiran (`/laporan`):**
   - Multi-filter: rentang tanggal, tukang, status, proyek.
   - **Ekspor Excel (.xlsx)** otomatis.
   - **Ekspor PDF** resmi berformat kop surat SMKS Muhammadiyah 2 Genteng.
   - **Ekspor CSV**.

10. **Audit Log & Keamanan Administrasi (`/audit-log`):**
    - Jejak pencatatan tidak dapat diubah (*immutable*) untuk setiap tindakan registrasi biometrik, login, absensi manual, dan koreksi data.

---

## 🔑 Akun Demo Bawaan

| Peran | Username | Password | Deskripsi |
|---|---|---|---|
| **Super Admin** | `admin` | `admin123` | Akses penuh konfigurasi sistem & laporan |
| **Pengawas Lapangan** | `pengawas1` | `pengawas123` | Pengawasan tukang, absensi manual, approval izin |
| **Pekerja / Tukang** | `tukang` | `tukang123` | Akses langsung ke halaman presensi kamera |

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- Web browser modern di HP (Google Chrome, Safari, atau Firefox)

### 2. Instalasi & Migrasi Database
```bash
# Clone atau buka direktori proyek
cd g:\Developments\tukang

# Pasang dependensi
npm install

# Inisialisasi basis data SQLite
node node_modules/prisma/build/index.js db push

# Isi data awal demo SMKS Muhammadiyah 2 Genteng
node prisma/seed.js
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui browser:
- Dari Komputer/Laptop: `http://localhost:3000`
- Dari HP dalam jaringan Wi-Fi sekolah yang sama: `http://[IP-KOMPUTER]:3000` (contoh: `http://192.168.1.50:3000`)

---

## 🔒 Prosedur Backup & Pemulihan Database

Basis data menggunakan SQLite (`prisma/dev.db`) yang dapat dibackup secara langsung:
- **Backup Manual:** Salin file `prisma/dev.db` ke folder penyimpanan cadangan yang aman.
- **Pemulihan (Restore):** Timpa file `prisma/dev.db` dengan file cadangan, lalu jalankan kembali aplikasi.

---

## 🏢 Identitas Institusi
**SMKS Muhammadiyah 2 Genteng**  
Jl. Hasanudin No. 103, Dusun Krajan, Genteng Wetan, Kec. Genteng, Kab. Banyuwangi, Jawa Timur 68465  
Telp: (0333) 845214
