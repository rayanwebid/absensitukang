"use client";

let faceapiInstance: any = null;
let modelsLoaded = false;
let loadingPromise: Promise<any> | null = null;

export async function loadFaceApi() {
  if (typeof window === "undefined") return null;

  if (faceapiInstance && modelsLoaded) {
    return faceapiInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      const faceapi = await import("@vladmandic/face-api");
      faceapiInstance = faceapi;

      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      return faceapi;
    } catch (err) {
      console.error("Failed to load face-api models:", err);
      loadingPromise = null;
      throw err;
    }
  })();

  return loadingPromise;
}

export function isModelsLoaded(): boolean {
  return modelsLoaded;
}
