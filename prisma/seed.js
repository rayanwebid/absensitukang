const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Helper to generate a normalized 128-dimension vector
function generateMockEmbedding(seed) {
  const vec = [];
  let sumSq = 0;
  for (let i = 0; i < 128; i++) {
    const val = Math.sin(seed * (i + 1)) * Math.cos(seed * 2.5 + i);
    vec.push(val);
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  return vec.map((v) => parseFloat((v / norm).toFixed(6)));
}

async function main() {
  console.log("Seeding database for SMKS Muhammadiyah 2 Genteng Absensi Tukang...");

  // 1. System Settings
  const settings = [
    { key: "school_name", value: "SMKS Muhammadiyah 2 Genteng", desc: "Nama institusi sekolah" },
    { key: "school_address", value: "Jl. Hasanudin No. 103, Dusun Krajan, Genteng Wetan, Kec. Genteng, Kab. Banyuwangi, Jawa Timur 68465", desc: "Alamat proyek/sekolah" },
    { key: "school_phone", value: "(0333) 845214", desc: "Kontak sekolah" },
    { key: "face_match_threshold", value: "0.55", desc: "Ambang batas jarak Euclidean Face Recognition (0.50 - 0.60)" },
    { key: "liveness_mode", value: "ACTIVE_CHALLENGE", desc: "Mode liveness anti-spoofing (ACTIVE_CHALLENGE / PASSIVE)" },
    { key: "allow_manual_override", value: "true", desc: "Izinkan pengawas melakukan absensi manual berizin" },
    { key: "timezone", value: "Asia/Jakarta", desc: "Zona waktu server resmi (WIB)" },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: s.key },
      update: { settingValue: s.value, description: s.desc },
      create: { settingKey: s.key, settingValue: s.value, description: s.desc, updatedBy: "SYSTEM" },
    });
  }

  // 2. Users (Super Admin & Pengawas)
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordPengawas = await bcrypt.hash("pengawas123", 10);
  const passwordTukang = await bcrypt.hash("tukang123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Bambang Sulistyo (Super Admin)",
      username: "admin",
      email: "admin@smkmuh2genteng.sch.id",
      passwordHash: passwordAdmin,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  const pengawas = await prisma.user.upsert({
    where: { username: "pengawas1" },
    update: {},
    create: {
      name: "Ir. Joko Susanto (Mandor Utama / Pengawas)",
      username: "pengawas1",
      email: "pengawas@smkmuh2genteng.sch.id",
      passwordHash: passwordPengawas,
      role: "PENGAWAS",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { username: "tukang" },
    update: {},
    create: {
      name: "Portal Mandiri Tukang SMKS Muh 2",
      username: "tukang",
      email: "tukang@smkmuh2genteng.sch.id",
      passwordHash: passwordTukang,
      role: "TUKANG",
      status: "ACTIVE",
    },
  });

  // 3. Work Schedule
  const defaultSchedule = await prisma.workSchedule.upsert({
    where: { id: "sched-standard-smk" },
    update: {},
    create: {
      id: "sched-standard-smk",
      name: "Jadwal Standar Proyek SMKS Muh 2 Genteng",
      startTime: "07:00",
      endTime: "16:00",
      gracePeriod: 15,
      workDays: "1,2,3,4,5,6",
      isActive: true,
    },
  });

  // 4. Projects at SMKS Muhammadiyah 2 Genteng
  const p1 = await prisma.project.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      projectName: "Pembangunan Gedung Workshop Teknik Mesin & TBSM",
      location: "Area Sayap Barat Kampus 1 SMKS Muh 2",
      description: "Pembangunan lantai 2 workshop teknik mesin, perakitan rangka baja, dan pengecoran lantai.",
      status: "IN_PROGRESS",
      supervisorId: pengawas.id,
      startDate: new Date("2026-09-01"),
    },
  });

  const p2 = await prisma.project.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      projectName: "Renovasi Laboratorium Komputer & Multimedia",
      location: "Gedung B Lantai 2",
      description: "Pemasangan partisi kedap suara, instalasi kelistrikan tersembunyi, dan plafon akustik.",
      status: "IN_PROGRESS",
      supervisorId: pengawas.id,
      startDate: new Date("2026-10-10"),
    },
  });

  const p3 = await prisma.project.upsert({
    where: { id: "proj-3" },
    update: {},
    create: {
      id: "proj-3",
      projectName: "Pemeliharaan & Pengecatan Masjid Asy-Syifa Sekolah",
      location: "Area Masjid Kompleks SMKS Muh 2 Genteng",
      description: "Pengecatan kubah, perbaikan talang air bocor, dan pembaruan keramik wudhu.",
      status: "PLANNING",
      supervisorId: pengawas.id,
      startDate: new Date("2026-11-01"),
    },
  });

  // 5. Workers (Data Tukang Lapangan SMKS Muhammadiyah 2 Genteng)
  const initialWorkers = [
    {
      workerCode: "TKG-001",
      name: "Slamet Riyadi",
      phone: "081234567801",
      jobType: "Tukang Batu & Pondasi",
      startDate: new Date("2026-08-15"),
      notes: "Keahlian pasang bata rapi, plesteran, dan pengecoran sloof.",
      projectId: p1.id,
      projectRole: "Tukang Utama",
    },
    {
      workerCode: "TKG-002",
      name: "Sugeng Santoso",
      phone: "081234567802",
      jobType: "Tukang Kayu & Plafon",
      startDate: new Date("2026-08-20"),
      notes: "Spesialis kusen aluminium, rangka gypsum, dan partisi.",
      projectId: p2.id,
      projectRole: "Tukang Utama",
    },
    {
      workerCode: "TKG-003",
      name: "Rudi Hermawan",
      phone: "081234567803",
      jobType: "Tukang Besi & Las",
      startDate: new Date("2026-09-01"),
      notes: "Sertifikasi las karbit & listrik, spesialis rangka atap baja ringan.",
      projectId: p1.id,
      projectRole: "Tukang Las",
    },
    {
      workerCode: "TKG-004",
      name: "Agus Wahyudi",
      phone: "081234567804",
      jobType: "Tukang Cat & Finishing",
      startDate: new Date("2026-09-10"),
      notes: "Finishing dinding halus dan epoxy lantai workshop.",
      projectId: p2.id,
      projectRole: "Finishing",
    },
    {
      workerCode: "TKG-005",
      name: "Eko Prasetyo",
      phone: "081234567805",
      jobType: "Kenek / Pembantu Tukang",
      startDate: new Date("2026-09-15"),
      notes: "Membantu pengadukan semen dan logistik material pasir.",
      projectId: p1.id,
      projectRole: "Pembantu Tukang",
    },
    {
      workerCode: "TKG-006",
      name: "Pak Warsito",
      phone: "081234567806",
      jobType: "Mandor Lapangan",
      startDate: new Date("2026-08-01"),
      notes: "Pengawas teknis lapangan harian proyek SMKS Muhammadiyah 2.",
      projectId: p1.id,
      projectRole: "Mandor Proyek",
    },
  ];

  for (let i = 0; i < initialWorkers.length; i++) {
    const wData = initialWorkers[i];
    const worker = await prisma.worker.upsert({
      where: { workerCode: wData.workerCode },
      update: {
        name: wData.name,
        phone: wData.phone,
        jobType: wData.jobType,
        notes: wData.notes,
      },
      create: {
        workerCode: wData.workerCode,
        name: wData.name,
        phone: wData.phone,
        jobType: wData.jobType,
        status: "ACTIVE",
        startDate: wData.startDate,
        notes: wData.notes,
      },
    });

    // Worker Assignment
    const existingAssign = await prisma.workerAssignment.findFirst({
      where: { workerId: worker.id, projectId: wData.projectId },
    });
    if (!existingAssign) {
      await prisma.workerAssignment.create({
        data: {
          workerId: worker.id,
          projectId: wData.projectId,
          roleInProject: wData.projectRole,
          startDate: wData.startDate,
          isActive: true,
        },
      });
    }

    // Biometric Face Profile Demo Seed
    const existingProfile = await prisma.faceProfile.findUnique({
      where: { workerId: worker.id },
    });
    if (!existingProfile) {
      const mockVec = generateMockEmbedding(i + 1);
      await prisma.faceProfile.create({
        data: {
          workerId: worker.id,
          encryptedEmbedding: JSON.stringify(mockVec),
          modelVersion: "vladmandic-face-api-v1",
          consentStatus: true,
          consentTimestamp: new Date(),
        },
      });
    }
  }

  // 6. Audit Log Initial
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorName: "Super Admin",
      action: "SYSTEM_INITIALIZED",
      entityType: "SYSTEM",
      metadata: JSON.stringify({ message: "Inisialisasi sistem absensi tukang SMKS Muhammadiyah 2 Genteng" }),
    },
  });

  console.log("Database seeded successfully with initial workers, schedule, and projects!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
