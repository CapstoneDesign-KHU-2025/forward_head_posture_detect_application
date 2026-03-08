/**
 * Pose detection Web Worker.
 * Uses worker-driven setInterval for frame requests — workers are less throttled
 * than the main thread in background tabs, which can improve real-time detection
 * when the tab is minimized or user switches to another tab.
 */

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let requestFrameTimer: ReturnType<typeof setInterval> | null = null;
const TARGET_FPS = 30;
const INTERVAL_MS = 1000 / TARGET_FPS;

type WorkerMessage =
  | { type: "init" }
  | { type: "frame"; payload: { bitmap: ImageBitmap; timestamp: number } }
  | { type: "stop" };

type WorkerResponse =
  | { type: "initDone"; payload?: { error?: string } }
  | { type: "requestFrame" }
  | { type: "result"; payload: { landmarks: Array<Array<{ x: number; y: number; z: number }>> } };

async function initPoseLandmarker(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

function detectPose(bitmap: ImageBitmap, timestamp: number): Array<Array<{ x: number; y: number; z: number }>> {
  if (!poseLandmarker) return [];
  const result = poseLandmarker.detectForVideo(bitmap, timestamp);
  return (result?.landmarks ?? []).map((lm) =>
    lm.map((p) => ({ x: p.x, y: p.y, z: p.z }))
  );
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === "init") {
    try {
      await initPoseLandmarker();
      requestFrameTimer = setInterval(() => {
        (self as unknown as Worker).postMessage({ type: "requestFrame" } as WorkerResponse);
      }, INTERVAL_MS);
      (self as unknown as Worker).postMessage({ type: "initDone" } as WorkerResponse);
    } catch (err) {
      (self as unknown as Worker).postMessage({
        type: "initDone",
        payload: { error: String(err) },
      } as WorkerResponse);
    }
    return;
  }

  if (msg.type === "frame" && msg.payload?.bitmap) {
    const { bitmap, timestamp } = msg.payload;
    try {
      const landmarks = detectPose(bitmap, timestamp);
      (self as unknown as Worker).postMessage({
        type: "result",
        payload: { landmarks },
      } as WorkerResponse);
    } finally {
      bitmap.close();
    }
    return;
  }

  if (msg.type === "stop") {
    if (requestFrameTimer) {
      clearInterval(requestFrameTimer);
      requestFrameTimer = null;
    }
    poseLandmarker?.close?.();
    poseLandmarker = null;
    return;
  }
};
