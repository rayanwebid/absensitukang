/**
 * Biometric Face Recognition & Liveness Engine Helpers
 * Mengimplementasikan kalkulasi jarak Euclidean untuk 128-d face embeddings
 * serta deteksi liveness anti-spoofing (Eye Aspect Ratio / MAR)
 * Sesuai PRD Bagian 6.3, 6.4, dan 8
 */

export const FACE_MATCH_THRESHOLD = 0.55; // Ambang batas jarak Euclidean (semakin kecil semakin identik)

export interface FaceMatchCandidate {
  workerId: string;
  workerCode: string;
  workerName: string;
  jobType: string;
  distance: number;
  confidence: number; // 0 - 100%
  isMatch: boolean;
}

/**
 * Hitung jarak Euclidean antara dua vektor embedding 128-dimensi
 */
export function calculateEuclideanDistance(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 1.0;
  }
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Konversi jarak Euclidean ke persentase keyakinan (Confidence Score)
 * Jarak 0.0 => 100%
 * Jarak 0.55 => ~60%
 * Jarak >= 0.8 => 0%
 */
export function distanceToConfidence(distance: number): number {
  if (distance <= 0) return 100;
  if (distance >= 0.8) return 0;
  const conf = Math.max(0, Math.min(100, Math.round((1 - distance / 0.8) * 100)));
  return conf;
}

/**
 * Cari profil wajah terdaftar yang paling cocok dengan embedding wajah kamera
 */
export function matchFaceAgainstProfiles(
  targetEmbedding: number[],
  registeredProfiles: Array<{
    workerId: string;
    workerCode: string;
    name: string;
    jobType: string;
    embedding: number[];
  }>,
  threshold: number = FACE_MATCH_THRESHOLD
): FaceMatchCandidate | null {
  if (!registeredProfiles || registeredProfiles.length === 0) {
    return null;
  }

  let bestMatch: FaceMatchCandidate | null = null;
  let minDistance = Infinity;

  for (const profile of registeredProfiles) {
    const dist = calculateEuclideanDistance(targetEmbedding, profile.embedding);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = {
        workerId: profile.workerId,
        workerCode: profile.workerCode,
        workerName: profile.name,
        jobType: profile.jobType,
        distance: parseFloat(dist.toFixed(4)),
        confidence: distanceToConfidence(dist),
        isMatch: dist <= threshold,
      };
    }
  }

  return bestMatch;
}

/**
 * Perhitungan jarak 2D antara dua titik koordinat
 */
function dist2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Eye Aspect Ratio (EAR) untuk deteksi kedipan mata (Blink Detection)
 * Titik mata 68-landmark standar:
 * Left Eye: 36, 37, 38, 39, 40, 41
 * Right Eye: 42, 43, 44, 45, 46, 47
 */
export function calculateEAR(landmarks: Array<{ x: number; y: number }>): {
  leftEar: number;
  rightEar: number;
  avgEar: number;
  isBlinking: boolean;
} {
  if (!landmarks || landmarks.length < 68) {
    return { leftEar: 0.3, rightEar: 0.3, avgEar: 0.3, isBlinking: false };
  }

  // Left eye
  const l_p1 = landmarks[36];
  const l_p2 = landmarks[37];
  const l_p3 = landmarks[38];
  const l_p4 = landmarks[39];
  const l_p5 = landmarks[40];
  const l_p6 = landmarks[41];

  const leftEar = (dist2D(l_p2, l_p6) + dist2D(l_p3, l_p5)) / (2.0 * dist2D(l_p1, l_p4));

  // Right eye
  const r_p1 = landmarks[42];
  const r_p2 = landmarks[43];
  const r_p3 = landmarks[44];
  const r_p4 = landmarks[45];
  const r_p5 = landmarks[46];
  const r_p6 = landmarks[47];

  const rightEar = (dist2D(r_p2, r_p6) + dist2D(r_p3, r_p5)) / (2.0 * dist2D(r_p1, r_p4));

  const avgEar = (leftEar + rightEar) / 2.0;
  // Ambang batas mata berkedip/tertutup biasanya < 0.20
  const isBlinking = avgEar < 0.21;

  return {
    leftEar: parseFloat(leftEar.toFixed(3)),
    rightEar: parseFloat(rightEar.toFixed(3)),
    avgEar: parseFloat(avgEar.toFixed(3)),
    isBlinking,
  };
}

/**
 * Mouth Aspect Ratio (MAR) untuk deteksi senyum / buka mulut
 * Inner mouth landmarks: 60..67
 */
export function calculateMAR(landmarks: Array<{ x: number; y: number }>): {
  mar: number;
  isOpenOrSmiling: boolean;
} {
  if (!landmarks || landmarks.length < 68) {
    return { mar: 0.1, isOpenOrSmiling: false };
  }

  const p60 = landmarks[60];
  const p61 = landmarks[61];
  const p63 = landmarks[63];
  const p64 = landmarks[64];
  const p65 = landmarks[65];
  const p67 = landmarks[67];

  const vert1 = dist2D(p61, p67);
  const vert2 = dist2D(p63, p65);
  const horiz = dist2D(p60, p64);

  const mar = horiz > 0 ? (vert1 + vert2) / (2.0 * horiz) : 0;
  const isOpenOrSmiling = mar > 0.35;

  return {
    mar: parseFloat(mar.toFixed(3)),
    isOpenOrSmiling,
  };
}
