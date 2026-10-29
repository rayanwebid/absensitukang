/**
 * Helper waktu terpusat server dengan zona waktu Asia/Jakarta (WIB)
 * Sesuai PRD Bagian 1, 6.4, dan 8: Server adalah sumber kebenaran resmi untuk waktu absensi
 */

export const TIMEZONE_WIB = "Asia/Jakarta";

export function getWibNow(): Date {
  return new Date();
}

/**
 * Format string tanggal WIB "YYYY-MM-DD"
 */
export function getWibDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_WIB,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // Output format: "YYYY-MM-DD"
}

/**
 * Format waktu WIB "HH:mm:ss"
 */
export function getWibTimeString(date: Date = new Date(), withSeconds: boolean = true): string {
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE_WIB,
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
  });
  return formatter.format(date).replace(/\./g, ":");
}

/**
 * Format tanggal lengkap Indonesia: "Kamis, 29 Oktober 2026"
 */
export function formatIndonesianDate(dateOrStr: Date | string | null | undefined): string {
  if (!dateOrStr) return "-";
  const date = typeof dateOrStr === "string" ? new Date(dateOrStr) : dateOrStr;
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE_WIB,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Evaluasi status absensi masuk berdasarkan jadwal & batas toleransi
 * @param checkInTime Date saat absen masuk
 * @param scheduleStartTime "07:00"
 * @param gracePeriodMinutes 15
 */
export function evaluateCheckInStatus(
  checkInTime: Date,
  scheduleStartTime: string = "07:00",
  gracePeriodMinutes: number = 15
): { status: "HADIR" | "TERLAMBAT"; minutesLate: number; note: string } {
  // Ambil jam & menit aktual dalam WIB
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE_WIB,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(checkInTime);

  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const actualMinutes = hour * 60 + minute;

  const [schedH, schedM] = scheduleStartTime.split(":").map((v) => parseInt(v, 10));
  const scheduledMinutes = schedH * 60 + schedM;
  const toleranceThreshold = scheduledMinutes + gracePeriodMinutes;

  if (actualMinutes <= toleranceThreshold) {
    return {
      status: "HADIR",
      minutesLate: 0,
      note: actualMinutes <= scheduledMinutes ? "Tepat Waktu" : `Dalam batas toleransi (${gracePeriodMinutes} mnt)`,
    };
  } else {
    const minutesLate = actualMinutes - scheduledMinutes;
    return {
      status: "TERLAMBAT",
      minutesLate,
      note: `Terlambat ${minutesLate} menit (Jadwal: ${scheduleStartTime}, Toleransi: ${gracePeriodMinutes} mnt)`,
    };
  }
}
