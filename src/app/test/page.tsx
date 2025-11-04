"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { FilesetResolver } from "@mediapipe/tasks-vision";
import isTurtleNeck from "@/utils/isTurtleNeck";

// test 를 위한 페이지입니다.
export default function TurtleNeckUploadPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);

  // timestamp refs to guarantee monotonic increase
  const lastTsRef = useRef<number>(0);

  // running state + ref (to avoid stale closure after Fast Refresh)
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "good" | "turtle" | "no-pose">("idle");
  const [fps, setFps] = useState<number>(0);
  const [drawLandmarks, setDrawLandmarks] = useState(true);
  const [logRows, setLogRows] = useState<string[]>([
    "ts_ms,video_time_ms,has_pose,turtle,earL_x,earL_y,earL_z,earR_x,earR_y,earR_z,shL_x,shL_y,shL_z,shR_x,shR_y,shR_z",
  ]);
  const [lmReady, setLmReady] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);

  const wasmBaseUrl = useMemo(() => "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm", []);

  function resetTimestamps() {
    lastTsRef.current = 0; // first ts will be > 0
  }

  function nextMonotonicTs(): number {
    // Use performance.now() but ensure it strictly increases
    const now = Math.floor(performance.now());
    const last = lastTsRef.current;
    const ts = now > last ? now : last + 1;
    lastTsRef.current = ts;
    return ts;
  }

  async function ensureLandmarker() {
    if (landmarkerRef.current) return;
    try {
      const { PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(wasmBaseUrl);
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      setLmReady(true);
    } catch (e: any) {
      console.error(e);
      setLastErr(String(e?.message || e));
    }
  }

  useEffect(() => {
    return () => {
      stopLoop();
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setLoaded(false);
    setStatus("idle");
    setFps(0);
    setLastErr(null);
    setLogRows([logRows[0]]);
    resetTimestamps();
  }

  function onLoadedMeta() {
    const v = videoRef.current!;
    const c = canvasRef.current!;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    setLoaded(true);
    resetTimestamps();
  }

  function stopLoop() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function loop() {
    const v = videoRef.current!;
    const c = canvasRef.current!;
    const lm = landmarkerRef.current;

    // Only proceed if we have data & are playing
    if (!lm || !v || v.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || v.paused || v.ended) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // if running state is used, check ref to avoid stale closure
    if (!runningRef.current) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // strictly monotonic timestamp
    const ts = nextMonotonicTs();

    let result;
    try {
      result = lm.detectForVideo(v, ts);
    } catch (e: any) {
      console.error("[detectForVideo] failed", e);
      setLastErr(String(e?.message || e));
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const poses = result.landmarks ?? [];

    if (!poses.length) {
      setStatus("no-pose");
      setLogRows((rows) => rows.concat(`${ts},${Math.floor(v.currentTime * 1000)},0,0,,,,,,,,,,,`));
    } else {
      const p = poses[0];

      if (drawLandmarks) {
        const idx = [7, 8, 11, 12];
        ctx.lineWidth = 2;
        ctx.fillStyle = "#0ea5e9";
        for (const i of idx) {
          const x = p[i].x * c.width;
          const y = p[i].y * c.height;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const lm7 = p[7],
        lm8 = p[8],
        lm11 = p[11],
        lm12 = p[12];
      const turtle = isTurtleNeck(
        { x: lm7.x, y: lm7.y, z: lm7.z },
        { x: lm8.x, y: lm8.y, z: lm8.z },
        { x: lm11.x, y: lm11.y, z: lm11.z },
        { x: lm12.x, y: lm12.y, z: lm12.z }
      );

      setStatus(turtle ? "turtle" : "good");

      const row = [
        ts,
        Math.floor(v.currentTime * 1000),
        1,
        turtle ? 1 : 0,
        lm7.x.toFixed(6),
        lm7.y.toFixed(6),
        lm7.z.toFixed(6),
        lm8.x.toFixed(6),
        lm8.y.toFixed(6),
        lm8.z.toFixed(6),
        lm11.x.toFixed(6),
        lm11.y.toFixed(6),
        lm11.z.toFixed(6),
        lm12.x.toFixed(6),
        lm12.y.toFixed(6),
        lm12.z.toFixed(6),
      ].join(",");
      setLogRows((rows) => rows.concat(row));
    }

    // FPS (EMA) using video clock
    const prevT = (v as any)._lastT as number | undefined;
    const curT = v.currentTime;
    if (prevT !== undefined) {
      const dt = Math.max(1 / 120, curT - prevT);
      const inst = 1 / dt;
      setFps((prev) => (prev ? prev * 0.9 + 0.1 * inst : inst));
    }
    (v as any)._lastT = curT;

    rafRef.current = requestAnimationFrame(loop);
  }

  function waitForCanPlay(video: HTMLVideoElement) {
    return new Promise<void>((resolve) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return resolve();
      const on = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", on);
        video.removeEventListener("canplay", on);
      };
      video.addEventListener("loadeddata", on, { once: true });
      video.addEventListener("canplay", on, { once: true });
      try {
        video.load();
      } catch {}
    });
  }

  async function playProcess() {
    const v = videoRef.current!;
    if (!fileUrl || !loaded) return;

    await ensureLandmarker();
    if (!landmarkerRef.current) {
      setLastErr((prev) => prev ?? "Landmarker init failed");
      return;
    }

    try {
      await waitForCanPlay(v);
    } catch (e: any) {
      setLastErr(String(e?.message || e));
      return;
    }

    try {
      await v.play();
    } catch (e: any) {
      setLastErr(String(e?.message || e));
      return;
    }

    setRunning(true);
    stopLoop();
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  }

  function pauseProcess() {
    const v = videoRef.current!;
    v.pause();
    setRunning(false);
  }

  function stopAndReset() {
    const v = videoRef.current!;
    v.pause();
    v.currentTime = 0;
    setRunning(false);
    setStatus("idle");
    setFps(0);
    resetTimestamps();
    stopLoop();
  }

  function downloadCSV() {
    const blob = new Blob([logRows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "turtleneck_video_log.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const statusText =
    status === "idle"
      ? "Idle"
      : status === "no-pose"
      ? "No person detected"
      : status === "turtle"
      ? "Turtle neck"
      : "Good posture";

  const statusColor = status === "turtle" ? "bg-red-500" : status === "good" ? "bg-emerald-500" : "bg-slate-500";

  const v = videoRef.current;
  const dur = v?.duration ?? 0;
  const cur = v?.currentTime ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">TurtleNeck – Video Upload (Front-View)</h1>

      <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-sm mb-1">Video file</label>
            <input type="file" accept="video/*" onChange={onPickFile} className="w-full" />

            <div className="mt-4 flex gap-2 items-center">
              <button
                onClick={playProcess}
                disabled={!fileUrl || !loaded || running}
                className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-40"
              >
                Play & Analyze
              </button>
              <button
                onClick={pauseProcess}
                disabled={!fileUrl || !loaded || !running}
                className="rounded-xl bg-slate-200 px-4 py-2 disabled:opacity-40"
              >
                Pause
              </button>
              <button
                onClick={stopAndReset}
                disabled={!fileUrl || !loaded}
                className="rounded-xl bg-slate-200 px-4 py-2 disabled:opacity-40"
              >
                Stop
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full ${statusColor} text-white px-3 py-1`}>
                {statusText}
              </span>
              <span className="text-sm text-slate-600">{fps ? `${fps.toFixed(1)} FPS` : ""}</span>
            </div>

            {lastErr && <div className="mt-3 text-xs text-red-600 whitespace-pre-wrap">{lastErr}</div>}

            <div className="mt-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <input
                  id="drawlm"
                  type="checkbox"
                  checked={drawLandmarks}
                  onChange={(e) => setDrawLandmarks(e.target.checked)}
                />
                <label htmlFor="drawlm">Draw landmarks (7,8,11,12)</label>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {lmReady ? "Pose model ready" : "Loading pose model… (first run may take a moment)"}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={downloadCSV}
                disabled={logRows.length <= 1}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 disabled:opacity-40"
              >
                Download CSV log
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Processing occurs during playback; seek/scrub is supported.</p>
            <p>• Landmarks used: 7, 8, 11, 12 → fed into your isTurtleNeck().</p>
            <p>• Timestamps are strictly monotonic to satisfy MediaPipe VIDEO mode.</p>
          </div>
        </div>

        <div className="relative w/full">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          <video
            ref={videoRef}
            src={fileUrl ?? undefined}
            onLoadedMetadata={onLoadedMeta}
            onSeeked={resetTimestamps}
            onPlay={() => setRunning(true)}
            onPause={() => setRunning(false)}
            onEnded={() => {
              setRunning(false);
              resetTimestamps();
            }}
            preload="auto"
            crossOrigin="anonymous"
            controls
            className="mt-3 w-full rounded-xl border"
          />

          {dur > 0 && (
            <div className="text-xs text-slate-500 mt-2">
              {cur.toFixed(2)} / {dur.toFixed(2)} sec
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
