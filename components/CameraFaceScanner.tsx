"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smile,
  ShieldCheck,
  UserCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { loadFaceApi } from "@/lib/faceApiLoader";
import { calculateEAR, calculateMAR, distanceToConfidence } from "@/lib/biometrics";
import { sounds } from "@/lib/audio";
import ReceiptModal, { ReceiptData } from "./ReceiptModal";

interface RegisteredFace {
  id: string;
  workerId: string;
  workerCode: string;
  name: string;
  jobType: string;
  projectName: string;
  embedding: number[];
}

export default function CameraFaceScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // States
  const [eventType, setEventType] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Biometrics & Registered faces
  const [registeredFaces, setRegisteredFaces] = useState<RegisteredFace[]>([]);
  const [matchedCandidate, setMatchedCandidate] = useState<{
    worker: RegisteredFace;
    confidence: number;
    distance: number;
  } | null>(null);

  // Liveness Challenge: "BLINK" | "SMILE"
  const [challengeType, setChallengeType] = useState<"BLINK" | "SMILE">("BLINK");
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [livenessProgress, setLivenessProgress] = useState(0); // 0 to 100%
  const [isVerifying, setIsVerifying] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  // Guidance status text
  const [guidanceText, setGuidanceText] = useState("Arahkan wajah ke dalam bingkai oval");

  // 1. Fetch registered faces from server
  const fetchRegisteredFaces = async () => {
    try {
      const res = await fetch("/api/attendance/registered-faces");
      const data = await res.json();
      if (data.profiles) {
        setRegisteredFaces(data.profiles);
      }
    } catch (e) {
      console.error("Error loading registered faces:", e);
    }
  };

  useEffect(() => {
    fetchRegisteredFaces();
  }, []);

  // 2. Load face-api AI models
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setGuidanceText("Memuat model biometrik AI...");
        await loadFaceApi();
        if (mounted) {
          setModelsReady(true);
          setGuidanceText("Arahkan wajah ke dalam bingkai oval");
        }
      } catch (err: any) {
        if (mounted) {
          setErrorMessage("Gagal memuat modul kecerdasan buatan biometrik.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 3. Start Camera Stream
  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Izin kamera ditolak. Berikan izin kamera pada browser HP Anda agar dapat melakukan absensi.");
      } else {
        setErrorMessage("Tidak dapat membuka kamera: " + (err.message || "Periksa perangkat Anda."));
      }
    }
  }, [facingMode]);

  useEffect(() => {
    if (modelsReady) {
      startCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [modelsReady, startCamera]);

  // Toggle camera front/back
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Helper Euclidean Distance
  const calcDistance = (a: number[], b: number[]): number => {
    if (!a || !b || a.length !== b.length) return 1.0;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  // 4. Capture Snapshot from Video
  const captureSnapshot = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.75);
  };

  // 5. Submit Attendance to Backend
  const submitAttendance = async (descriptorArray: number[], snapshot: string, score: number) => {
    setIsVerifying(true);
    setGuidanceText("Memverifikasi dengan server...");

    try {
      const res = await fetch("/api/attendance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          embedding: descriptorArray,
          photoSnapshot: snapshot,
          livenessPassed: true,
          livenessScore: score,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (soundEnabled) sounds.playWarning();
        setErrorMessage(data.error || data.detail || "Gagal memproses absensi.");
        setGuidanceText("Silakan coba lagi");
        setIsVerifying(false);
        // Reset challenge
        setLivenessPassed(false);
        setLivenessProgress(0);
        return;
      }

      // Success!
      if (soundEnabled) sounds.playSuccess();
      setReceipt(data.receipt);
      setGuidanceText("Absensi Berhasil!");
      setIsVerifying(false);
    } catch (err: any) {
      if (soundEnabled) sounds.playWarning();
      setErrorMessage("Koneksi ke server gagal: " + err.message);
      setIsVerifying(false);
      setLivenessPassed(false);
      setLivenessProgress(0);
    }
  };

  // 6. Real-time Face Detection Loop
  useEffect(() => {
    if (!modelsReady || !cameraActive || isVerifying || receipt) return;

    let isProcessing = false;
    let consecutiveChallengeFrames = 0;

    const detectLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && !isProcessing && !receipt) {
        isProcessing = true;
        try {
          const faceapi = await loadFaceApi();
          if (faceapi && videoRef.current) {
            const detection = await faceapi
              .detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
              )
              .withFaceLandmarks()
              .withFaceDescriptor()
              .withFaceExpressions();

            if (detection) {
              const landmarks = detection.landmarks.positions;
              const descriptorArray: number[] = Array.from(detection.descriptor).map(Number);

              // 1. Local Face Matching Preview
              let bestMatch: RegisteredFace | null = null;
              let minDistance = Infinity;

              for (const rf of registeredFaces) {
                if (rf.embedding && rf.embedding.length === 128) {
                  const dist = calcDistance(descriptorArray, rf.embedding);
                  if (dist < minDistance) {
                    minDistance = dist;
                    bestMatch = rf;
                  }
                }
              }

              if (bestMatch && minDistance <= 0.60) {
                setMatchedCandidate({
                  worker: bestMatch,
                  confidence: distanceToConfidence(minDistance),
                  distance: parseFloat(minDistance.toFixed(3)),
                });
              } else {
                setMatchedCandidate(null);
              }

              // 2. Liveness Evaluation
              if (!livenessPassed) {
                if (challengeType === "BLINK") {
                  const ear = calculateEAR(landmarks);
                  setGuidanceText("Tukang terdeteksi: Silakan KEDIPKAN MATA Anda 👁️");

                  if (ear.isBlinking) {
                    consecutiveChallengeFrames++;
                    setLivenessProgress(Math.min(100, consecutiveChallengeFrames * 35));
                    if (consecutiveChallengeFrames >= 2) {
                      setLivenessPassed(true);
                      setLivenessProgress(100);
                      if (soundEnabled) sounds.playChallengePass();
                      const snapshot = captureSnapshot();
                      submitAttendance(descriptorArray, snapshot || "", 0.95);
                    }
                  }
                } else if (challengeType === "SMILE") {
                  const mar = calculateMAR(landmarks);
                  const isSmiling = detection.expressions?.happy > 0.6 || mar.isOpenOrSmiling;
                  setGuidanceText("Tukang terdeteksi: Silakan TERSENYUM ke kamera 😊");

                  if (isSmiling) {
                    consecutiveChallengeFrames++;
                    setLivenessProgress(Math.min(100, consecutiveChallengeFrames * 35));
                    if (consecutiveChallengeFrames >= 2) {
                      setLivenessPassed(true);
                      setLivenessProgress(100);
                      if (soundEnabled) sounds.playChallengePass();
                      const snapshot = captureSnapshot();
                      submitAttendance(descriptorArray, snapshot || "", 0.95);
                    }
                  }
                }
              }
            } else {
              setMatchedCandidate(null);
              setGuidanceText("Posisikan wajah Anda di dalam lingkaran oval");
              consecutiveChallengeFrames = 0;
              setLivenessProgress(0);
            }
          }
        } catch (e) {
          // ignore loop exceptions
        } finally {
          isProcessing = false;
        }
      }

      if (!receipt) {
        animFrameRef.current = requestAnimationFrame(detectLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [modelsReady, cameraActive, registeredFaces, challengeType, livenessPassed, isVerifying, receipt, soundEnabled]);

  // Reset scanner after closing receipt modal
  const handleCloseReceipt = () => {
    setReceipt(null);
    setLivenessPassed(false);
    setLivenessProgress(0);
    setMatchedCandidate(null);
    setErrorMessage(null);
    // Cycle challenge between BLINK and SMILE for next check
    setChallengeType((prev) => (prev === "BLINK" ? "SMILE" : "BLINK"));
    setGuidanceText("Arahkan wajah ke dalam bingkai oval");
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Mode Selector (Absen Masuk vs Absen Pulang) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/80 rounded-2xl shadow-inner">
        <button
          onClick={() => {
            setEventType("CHECK_IN");
            handleCloseReceipt();
          }}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            eventType === "CHECK_IN"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-[1.02]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
          <span>ABSEN MASUK</span>
        </button>

        <button
          onClick={() => {
            setEventType("CHECK_OUT");
            handleCloseReceipt();
          }}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            eventType === "CHECK_OUT"
              ? "bg-gradient-to-r from-muh-blue to-muh-navy text-white shadow-md scale-[1.02]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse"></span>
          <span>ABSEN PULANG</span>
        </button>
      </div>

      {/* Main Camera Viewfinder Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border-4 border-muh-navy aspect-[3/4] sm:aspect-[4/3] flex items-center justify-center">
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading Overlay */}
        {!modelsReady && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white z-20 space-y-3">
            <RefreshCw className="w-10 h-10 text-muh-teal animate-spin" />
            <h4 className="font-bold text-sm">Menyiapkan Biometrik Wajah AI...</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Memuat model deteksi liveness anti-spoofing untuk SMKS Muhammadiyah 2 Genteng.
            </p>
          </div>
        )}

        {/* Camera Permission / Error Overlay */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center text-white z-30 space-y-3">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
            <h4 className="font-bold text-sm text-rose-300">Peringatan Absensi</h4>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => {
                setErrorMessage(null);
                startCamera();
              }}
              className="mt-3 px-5 py-2.5 bg-muh-teal hover:bg-cyan-400 text-muh-navy font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Face Oval Frame Guide & Scanline */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
          <div
            className={`relative w-64 h-80 sm:w-72 sm:h-96 rounded-[50%] border-4 transition-colors duration-300 ${
              livenessPassed
                ? "border-emerald-400 shadow-[0_0_25px_#10B981]"
                : matchedCandidate
                ? "border-muh-teal shadow-[0_0_20px_#05BFDB]"
                : "border-white/50 border-dashed"
            }`}
          >
            {/* Animated Laser Beam */}
            {!livenessPassed && <div className="scanner-beam"></div>}

            {/* Corner Bracket Accents */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
              {challengeType === "BLINK" ? "Tantangan: Kedip Mata" : "Tantangan: Senyum"}
            </div>
          </div>
        </div>

        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          {/* Liveness Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white border border-slate-700">
            <ShieldCheck className={`w-4 h-4 ${livenessPassed ? "text-emerald-400" : "text-muh-teal"}`} />
            <span>{livenessPassed ? "Liveness Valid" : "Anti-Spoofing Aktif"}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute/Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800"
              title="Toggle Suara"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-muh-gold" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Switch Camera Button (Front / Back) */}
            <button
              onClick={toggleCameraFacing}
              className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition-transform active:rotate-180"
              title="Ganti Kamera Depan/Belakang"
            >
              <SwitchCamera className="w-4 h-4 text-muh-teal" />
            </button>
          </div>
        </div>

        {/* Bottom Candidate & Guidance Banner */}
        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
          {/* Identified Worker Pill */}
          {matchedCandidate && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-muh-teal/50 rounded-2xl p-2.5 flex items-center justify-between text-white animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-muh-blue flex items-center justify-center font-bold text-xs text-white">
                  <UserCheck className="w-5 h-5 text-muh-teal" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{matchedCandidate.worker.name}</span>
                    <span className="text-[10px] text-muh-teal bg-muh-navy px-1.5 py-0.5 rounded">
                      {matchedCandidate.worker.workerCode}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300">{matchedCandidate.worker.jobType}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-400">{matchedCandidate.confidence}%</span>
                <span className="block text-[9px] text-slate-400">Kemiripan</span>
              </div>
            </div>
          )}

          {/* Interactive Challenge & Guidance Pill */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-white mb-1.5">
              {challengeType === "BLINK" ? (
                <Eye className="w-4 h-4 text-muh-teal animate-pulse" />
              ) : (
                <Smile className="w-4 h-4 text-muh-gold animate-pulse" />
              )}
              <span>{guidanceText}</span>
            </div>

            {/* Liveness Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-muh-teal to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${livenessProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Information Box */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-muh-blue shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold text-slate-800">Petunjuk Absensi Mandiri: </span>
          <span>
            Posisikan wajah Anda tepat di dalam bingkai oval di tempat terang. Ikuti instruksi kedip mata atau senyum
            untuk memastikan keaslian kehadiran langsung (anti-foto palsu). Waktu absensi tercatat otomatis oleh server
            WIB.
          </span>
        </div>
      </div>

      {/* Confirmation Receipt Modal */}
      <ReceiptModal receipt={receipt} onClose={handleCloseReceipt} />
    </div>
  );
}
