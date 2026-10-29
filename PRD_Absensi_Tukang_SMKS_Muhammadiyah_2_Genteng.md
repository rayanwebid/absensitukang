# PRD.md — Sistem Absensi Tukang Berbasis Face Recognition
## SMKS Muhammadiyah 2 Genteng

**Versi:** 1.0  
**Tanggal:** 29 Oktober 2026  
**Platform:** Responsive Web / Progressive Web App (PWA)  
**Zona waktu:** Asia/Jakarta (WIB)

---

## 1. Ringkasan Produk

Sistem Absensi Tukang Digital adalah aplikasi website untuk mencatat kehadiran tukang yang bekerja di lingkungan SMKS Muhammadiyah 2 Genteng. Tukang melakukan absensi masuk dan pulang melalui kamera HP dengan verifikasi wajah. Admin dan pengawas dapat mengelola data tukang, jadwal, izin, proyek, rekap kehadiran, serta laporan.

Sistem harus mengutamakan kemudahan penggunaan di HP, ketepatan waktu dari server, keamanan data biometrik, pencegahan absensi ganda, dan jejak audit.

## 2. Latar Belakang

Pencatatan kehadiran manual berisiko menimbulkan kesalahan rekap, manipulasi kehadiran, keterlambatan pelaporan, serta kesulitan memantau jam kerja dan penugasan. Aplikasi ini memusatkan data kehadiran dalam sistem digital yang mudah dipantau dan dilaporkan.

## 3. Tujuan

- Mempercepat proses absensi masuk dan pulang.
- Mengurangi praktik titip absen menggunakan foto atau identitas orang lain.
- Memudahkan pengawasan kehadiran tukang.
- Mencatat keterlambatan, izin, sakit, dan koreksi absensi.
- Menyediakan laporan harian, mingguan, bulanan, dan per proyek.
- Menyediakan data terpusat dengan hak akses yang terkontrol.

## 4. Ruang Lingkup

### Termasuk dalam MVP
1. Login dan manajemen peran.
2. Manajemen data tukang.
3. Registrasi wajah tukang.
4. Absensi masuk dan pulang melalui kamera HP.
5. Pencocokan wajah dan pemeriksaan liveness/anti-spoofing.
6. Pengaturan jadwal dan toleransi keterlambatan.
7. Dashboard kehadiran.
8. Riwayat absensi.
9. Laporan dan ekspor Excel/PDF.
10. Audit log untuk tindakan administratif.

### Tahap lanjutan
- Pengajuan izin dan sakit.
- Manajemen proyek dan penugasan.
- Geofence/GPS jika diperlukan.
- Notifikasi WhatsApp melalui penyedia resmi.
- Dokumentasi progres pekerjaan.
- Rekap jam kerja dan lembur yang disetujui.

## 5. Jenis Pengguna dan Hak Akses

### 5.1 Super Admin
- Mengelola seluruh konfigurasi sistem.
- Mengelola akun admin/pengawas.
- Menambah, mengubah, menonaktifkan data tukang.
- Mengatur jadwal, toleransi, hari kerja, dan proyek.
- Melihat dan mengekspor seluruh laporan.
- Melihat audit log.
- Mengelola retensi dan penghapusan data biometrik sesuai kebijakan.

### 5.2 Pengawas/Admin Lapangan
- Melihat data tukang dan kehadiran sesuai kewenangan.
- Memeriksa aktivitas lapangan.
- Menyetujui izin dan koreksi absensi sesuai hak akses.
- Membuat laporan yang diizinkan.

### 5.3 Tukang
- Login atau melakukan verifikasi akun sesuai rancangan autentikasi.
- Melakukan absensi masuk dan pulang.
- Melihat riwayat absensi sendiri.
- Mengajukan izin/sakit jika modul tersebut diaktifkan.
- Melihat status dan pesan kegagalan absensi.

## 6. Fitur Fungsional

### 6.1 Dashboard
Menampilkan:
- Total tukang aktif.
- Hadir hari ini.
- Terlambat.
- Izin/sakit.
- Belum absen masuk.
- Belum absen pulang.
- Aktivitas absensi terbaru.
- Grafik kehadiran.
- Filter tanggal, nama tukang, status, dan proyek.

Angka statistik harus berasal dari database aktual. Data demo harus diberi label demo dan tidak boleh tercampur dengan produksi.

### 6.2 Manajemen Data Tukang
Admin dapat menambah, melihat, mengubah, dan menonaktifkan tukang.

Data minimal:
- ID tukang otomatis.
- Nama lengkap.
- Foto profil (opsional, terpisah dari data biometrik).
- Nomor HP (jika diperlukan).
- Jenis pekerjaan/keahlian.
- Status aktif/nonaktif.
- Tanggal mulai bekerja.
- Proyek atau lokasi penugasan (jika digunakan).

Hindari pengumpulan nomor identitas resmi jika tidak diperlukan.

### 6.3 Registrasi Wajah
1. Admin memverifikasi identitas tukang secara langsung.
2. Admin membuka proses registrasi wajah.
3. Kamera mengambil sampel wajah dengan pencahayaan yang memadai.
4. Sistem memeriksa kualitas gambar dan posisi wajah.
5. Sistem membuat template biometrik/face embedding menggunakan model yang telah dievaluasi.
6. Admin mengonfirmasi dan mengaktifkan profil.
7. Tukang diberi informasi tentang tujuan pemrosesan, masa simpan, akses, dan mekanisme pengaduan.

Data biometrik harus dilindungi. Hindari menyimpan foto wajah mentah jika tidak diperlukan. Template biometrik tetap merupakan data sensitif dan tidak otomatis anonim.

### 6.4 Absensi Face Recognition
Alur:
1. Tukang membuka website melalui browser HP.
2. Tukang memilih **Absen Masuk** atau **Absen Pulang**.
3. Browser meminta izin kamera bila belum diberikan.
4. Aplikasi memandu posisi wajah.
5. Sistem melakukan deteksi wajah, pencocokan terhadap profil terdaftar, dan pemeriksaan liveness.
6. Backend memvalidasi jadwal, identitas, status akun, dan aturan duplikasi.
7. Backend mencatat waktu server dan hasil verifikasi.
8. Aplikasi menampilkan bukti absensi setelah server mengonfirmasi penyimpanan.

Aturan:
- Waktu resmi berasal dari server, bukan jam perangkat.
- Cegah absensi ganda untuk jenis absensi dan jadwal yang sama.
- Absensi pulang mengikuti aturan absensi masuk, kecuali ada koreksi yang disetujui.
- Kegagalan verifikasi harus memberikan pesan yang jelas.
- Jangan menyatakan absensi berhasil sebelum server mengonfirmasi penyimpanan.
- Sediakan proses verifikasi manual oleh pengawas jika wajah tidak terbaca, kamera rusak, atau kondisi khusus terjadi. Semua pengecualian harus mencatat alasan dan petugas yang menyetujui.
- Foto atau video yang ditampilkan ke kamera tidak boleh dianggap otomatis aman; liveness harus diuji secara khusus.

### 6.5 Jadwal dan Aturan Kerja
Admin dapat mengatur:
- Jam masuk dan pulang.
- Hari kerja.
- Toleransi keterlambatan.
- Jadwal berbeda berdasarkan kelompok/proyek.
- Hari libur.
- Aturan lembur bila diterapkan.

**Contoh konfigurasi awal, wajib disesuaikan dengan kebijakan sekolah:**

| Pengaturan | Contoh |
|---|---|
| Jam masuk | 07.00 WIB |
| Batas toleransi | 15 menit |
| Jam pulang | 16.00 WIB |
| Hari kerja | Senin–Sabtu |
| Absen masuk | 1 kali per hari kerja |
| Absen pulang | 1 kali per hari kerja |

### 6.6 Izin, Sakit, dan Koreksi Absensi
- Tukang dapat mengajukan izin/sakit jika modul diaktifkan.
- Pengawas dapat menyetujui atau menolak.
- Koreksi waktu wajib menyertakan alasan.
- Perubahan tidak menghapus rekaman awal.
- Simpan siapa yang meminta, menyetujui, waktu perubahan, dan alasan.
- Status meliputi hadir, terlambat, izin, sakit, tanpa keterangan, dan belum lengkap.

### 6.7 Proyek dan Penugasan
Jika tukang bekerja di beberapa lokasi, sistem dapat menyimpan:
- Nama proyek/pekerjaan.
- Lokasi.
- Penanggung jawab.
- Daftar tukang yang ditugaskan.
- Tanggal mulai dan selesai.
- Status pekerjaan.
- Catatan aktivitas harian.

### 6.8 Laporan
Jenis laporan:
1. Rekap absensi harian.
2. Rekap bulanan per tukang.
3. Daftar keterlambatan.
4. Daftar izin dan sakit.
5. Daftar belum absen masuk/pulang.
6. Jam kerja aktual dan lembur yang disetujui.
7. Rekap per proyek.
8. Riwayat koreksi dan audit.

Format:
- Excel (.xlsx).
- PDF.
- CSV sebagai opsi tambahan.

Perhitungan durasi kerja harus mengikuti aturan istirahat, izin meninggalkan lokasi, dan kebijakan kerja. Durasi antara masuk dan pulang tidak otomatis sama dengan jam kerja produktif.

## 7. Struktur Halaman

| Rute | Fungsi |
|---|---|
| `/login` | Login admin/pengawas |
| `/absensi` | Halaman absensi masuk/pulang |
| `/absensi/riwayat` | Riwayat absensi pribadi |
| `/dashboard` | Statistik dan aktivitas |
| `/tukang` | Daftar tukang |
| `/tukang/tambah` | Tambah tukang dan registrasi wajah |
| `/jadwal` | Pengaturan jadwal |
| `/izin` | Pengajuan dan persetujuan izin |
| `/proyek` | Proyek dan penugasan |
| `/laporan` | Filter, rekap, dan ekspor |
| `/pengguna` | Manajemen akun dan peran |
| `/pengaturan` | Konfigurasi sistem |
| `/audit-log` | Jejak tindakan administratif |

Tukang harus langsung diarahkan ke halaman absensi setelah masuk, bukan dashboard admin.

## 8. Rekomendasi Teknologi

- **Frontend:** Next.js + TypeScript.
- **UI:** Tailwind CSS atau sistem desain konsisten yang setara.
- **Backend:** API terautentikasi dengan validasi server.
- **Database:** PostgreSQL; Supabase dapat dipertimbangkan untuk mempercepat pengembangan jika kebijakan akses dikonfigurasi dengan benar.
- **Biometrik:** layanan/library face recognition yang layak produksi, dengan liveness detection dan evaluasi keamanan.
- **Deployment:** hosting HTTPS, backup terjadwal, monitoring, dan domain sekolah.
- **PWA:** opsional untuk memasang pintasan di layar utama HP.

Keputusan akhir teknologi biometrik harus dibuat setelah uji kompatibilitas kamera HP, akurasi, performa, lisensi, privasi, dan biaya.

### Prinsip arsitektur
1. Backend adalah sumber kebenaran untuk waktu, identitas, jadwal, dan status absensi.
2. Jangan mempercayai hasil verifikasi yang hanya dikirim oleh frontend tanpa validasi server.
3. Jangan membuat algoritma biometrik sendiri dari nol.
4. Uji false acceptance rate, false rejection rate, serta serangan foto/video sebelum peluncuran.
5. GPS/geofence bukan bukti mutlak karena lokasi dapat dipalsukan.
6. Kamera browser umumnya membutuhkan HTTPS dan izin pengguna.
7. Jangan menganggap aplikasi bisa bekerja offline untuk absensi biometrik yang belum dikonfirmasi server.

## 9. Rancangan Database

| Tabel | Kolom inti |
|---|---|
| `users` | id, name, username/email, password_hash atau provider_id, role, status |
| `workers` | id, worker_code, name, phone, job_type, status, start_date |
| `face_profiles` | id, worker_id, encrypted_embedding, model_version, consent_status, created_at |
| `work_schedules` | id, name, start_time, end_time, grace_period, work_days |
| `attendance` | id, worker_id, work_date, check_in_at, check_out_at, status, schedule_id |
| `attendance_events` | id, attendance_id, event_type, server_timestamp, verification_result, reason |
| `projects` | id, project_name, location, supervisor_id, status |
| `worker_assignments` | id, worker_id, project_id, start_date, end_date |
| `leave_requests` | id, worker_id, leave_type, start_date, end_date, reason, approval_status |
| `attendance_corrections` | id, attendance_id, proposed_values, reason, requested_by, approved_by, status |
| `audit_logs` | id, actor_id, action, entity_type, entity_id, timestamp, metadata |
| `system_settings` | id, setting_key, setting_value, updated_by |

### Integritas database
- Gunakan foreign key dan indeks pada kolom pencarian yang sering digunakan.
- Terapkan batas unik sesuai model jadwal agar absensi ganda tidak tersimpan.
- Gunakan transaksi database saat menyimpan absensi.
- Simpan timestamp secara konsisten dan tampilkan dalam `Asia/Jakarta`.
- Pisahkan data biometrik dari data administrasi.
- Jangan menyimpan kata sandi dalam teks biasa.
- Jangan menulis embedding, token, atau informasi sensitif ke log.
- Tentukan kebijakan retensi dan penghapusan data sebelum produksi.

## 10. Keamanan dan Privasi

- HTTPS wajib untuk halaman yang menggunakan kamera.
- Role-based access control (RBAC).
- Pembatasan percobaan login dan verifikasi.
- Validasi input di server.
- Perlindungan dari CSRF, XSS, SQL injection, dan akses lintas pengguna.
- Audit log untuk tindakan administratif.
- Backup terenkripsi dan pengujian pemulihan.
- Pembatasan akses biometrik hanya pada komponen yang memerlukannya.
- Pengelolaan kunci enkripsi secara aman.
- Informasi yang transparan mengenai tujuan pemrosesan, jenis data, masa simpan, akses, dan pengaduan.
- Jalur alternatif yang wajar jika biometrik gagal.
- Evaluasi kepatuhan terhadap UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi dan aturan terkait sebelum implementasi.

Persetujuan dan dasar pemrosesan yang sah, retensi, keamanan, serta hak subjek data perlu ditangani secara tepat. Face embedding tetap merupakan data biometrik sensitif.

## 11. Kebutuhan Nonfungsional

| Aspek | Target awal |
|---|---|
| Perangkat | Android, iPhone, tablet, desktop yang kompatibel |
| Browser | Browser modern yang mendukung kamera |
| Respons halaman | p95 di bawah 2 detik pada koneksi memadai |
| Proses absensi | p95 di bawah 5 detik, tidak termasuk gangguan perangkat/jaringan |
| Integritas | Absensi yang dikonfirmasi server tidak hilang |
| Skalabilitas | Mendukung pertumbuhan jumlah tukang dan proyek |
| Aksesibilitas | Tombol besar, teks jelas, kontras memadai |
| Pemeliharaan | Kode modular, dokumentasi API, pengujian otomatis |
| Backup | Terjadwal dan pemulihannya diuji |
| Audit | Perubahan administratif penting tercatat |

Target performa harus divalidasi lewat pengujian beban dan perangkat nyata; bukan jaminan otomatis.

## 12. Kriteria Penerimaan

Aplikasi siap digunakan jika:
- Admin dapat menambah tukang dan mendaftarkan wajah.
- Wajah terdaftar dapat diverifikasi dan wajah yang tidak cocok ditolak sesuai ambang teruji.
- Pemeriksaan liveness telah diuji terhadap foto, video, dan serangan spoofing lain.
- Waktu absensi berasal dari server dan ditampilkan dalam WIB.
- Absensi ganda dicegah sesuai jenis absensi dan jadwal.
- Izin dan koreksi memerlukan otorisasi serta meninggalkan jejak audit.
- Laporan dapat difilter dan diekspor dengan data yang benar.
- Tukang hanya dapat mengakses data miliknya.
- Aplikasi tidak menampilkan sukses sebelum server mengonfirmasi penyimpanan.
- Backup berhasil dipulihkan dan hasilnya diverifikasi.
- Seluruh tombol, filter, formulir, dan aksi CRUD terhubung ke backend nyata.

## 13. Tahapan Pengembangan

### Fase 1 — Fondasi
Desain UI/UX, autentikasi, peran, database, data tukang, dan jadwal.

### Fase 2 — Absensi biometrik
Integrasi kamera, registrasi wajah, face matching, liveness, validasi server, dan bukti absensi.

### Fase 3 — Administrasi
Dashboard, izin, koreksi, proyek, laporan, ekspor, dan audit log.

### Fase 4 — Pengujian dan peluncuran
Pengujian keamanan dan akurasi, uji berbagai HP, pelatihan admin, migrasi data, dan peluncuran bertahap.

Perkiraan awal 4–8 minggu untuk tim kecil dengan ruang lingkup yang terkendali. Pengujian biometrik, layanan pihak ketiga, dan fitur tambahan dapat memperpanjang jadwal.

## 14. Fitur Lanjutan

- Notifikasi WhatsApp melalui penyedia resmi.
- Geofence/GPS bila dibutuhkan.
- Dokumentasi progres pekerjaan.
- Rekap biaya tenaga kerja berdasarkan tarif dan jam yang disetujui.
- Jalur verifikasi manual yang diawasi.
- Pengingat absensi pulang.

## 15. Instruksi untuk Developer / AI Coding Agent

Bangun aplikasi yang benar-benar berfungsi, bukan hanya dashboard statis.

1. Buat struktur proyek modular dan komponen UI reusable.
2. Buat migrasi database, backend API, autentikasi, dan kebijakan akses.
3. Implementasikan registrasi serta verifikasi wajah menggunakan teknologi yang dievaluasi untuk produksi.
4. Implementasikan absensi masuk/pulang dengan validasi server, anti-duplikasi, dan audit.
5. Bangun dashboard, manajemen tukang, jadwal, izin, proyek, dan laporan.
6. Pastikan seluruh tombol, filter, formulir, ekspor, dan aksi CRUD bekerja dengan database nyata.
7. Sediakan data demo berlabel jelas dan pisahkan dari data produksi.
8. Tambahkan loading state, validasi, penanganan error, dan tampilan responsif.
9. Buat pengujian unit, integrasi, dan end-to-end, terutama untuk aturan absensi dan keamanan biometrik.
10. Sediakan `.env.example`, dokumentasi instalasi, konfigurasi deployment, backup, dan pemulihan.
11. Jangan menyimpan rahasia API atau kredensial di source code.
12. Jangan meluncurkan sistem biometrik sebelum uji akurasi, liveness, keamanan, dan kepatuhan selesai.

### Definisi Selesai
Aplikasi dapat dipasang di hosting, diakses melalui browser HP, mendaftarkan tukang, memverifikasi wajah dengan mekanisme yang telah diuji, mencatat absensi secara sah, dan menghasilkan laporan yang dapat dipertanggungjawabkan.

---

## Rekomendasi Implementasi

Mulai dengan MVP: data tukang, registrasi wajah, absensi masuk/pulang, jadwal, dashboard, dan laporan. Setelah alur inti stabil, tambahkan izin, proyek, GPS, dan notifikasi. Pendekatan bertahap membantu mengendalikan biaya dan kompleksitas tanpa mengabaikan keamanan.
