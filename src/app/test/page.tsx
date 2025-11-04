"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { FilesetResolver } from "@mediapipe/tasks-vision";
import isTurtleNeck from "@/utils/isTurtleNeck";
import { Button } from "@/components/atoms/button/Button";

type TurtleStatus = "idle" | "good" | "turtle" | "no-pose";

type TestInfo = {
  monitorDistance: number; // cm
  monitorHight: number; // cm (오타 원문 유지: Hight)
  angleBetweenBodyAndCam: number; // deg
  isHairTied: boolean;
  turtleNeckLevel: "none" | "mild" | "severe";
};

type Period = { start: number; end: number; duration: number };

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
  const [status, setStatus] = useState<TurtleStatus>("idle");
  const [fps, setFps] = useState<number>(0);
  const [drawLandmarks, setDrawLandmarks] = useState(true);
  const [logRows, setLogRows] = useState<string[]>([
    "ts_ms,video_time_ms,has_pose,turtle,earL_x,earL_y,earL_z,earR_x,earR_y,earR_z,shL_x,shL_y,shL_z,shR_x,shR_y,shR_z",
  ]);
  const [lmReady, setLmReady] = useState(false);
  const [lastErr, setLastErr] = useState<string | null>(null);

  // ====== testInfo 입력 상태 & 저장 리스트 ======
  const [testInfo, setTestInfo] = useState<TestInfo>({
    monitorDistance: 0,
    monitorHight: 0,
    angleBetweenBodyAndCam: 0,
    isHairTied: true,
    turtleNeckLevel: "none",
  });

  // 저장해둔 testInfo들을 쌓아두는 리스트
  const [savedTestInfos, setSavedTestInfos] = useState<Array<TestInfo & { savedAt: string }>>([]);

  // ====== 거북목 구간 수집 ======
  const [turtleNeckPeriods, setTurtleNeckPeriods] = useState<Period[]>([]);
  const turtleStartTimeRef = useRef<number | null>(null);

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
    setTurtleNeckPeriods([]);
    turtleStartTimeRef.current = null;
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

  // ====== 거북목 구간 수집 로직 ======
  function handleTurtleTimeline(turtle: boolean, videoTime: number) {
    if (turtle) {
      // 구간 시작 마킹
      if (turtleStartTimeRef.current == null) {
        turtleStartTimeRef.current = videoTime;
      }
    } else {
      // 구간 종료 & push
      if (turtleStartTimeRef.current != null) {
        const start = turtleStartTimeRef.current;
        const end = Math.max(videoTime, start); // 역전 방지
        const duration = end - start;
        setTurtleNeckPeriods((prev) => [...prev, { start, end, duration }]);
        turtleStartTimeRef.current = null;
      }
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
      // 포즈가 없으면 거북목 종료로 간주(열려 있던 구간 닫기)
      handleTurtleTimeline(false, v.currentTime);
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
      handleTurtleTimeline(turtle, v.currentTime);

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
    // 비디오가 정지/끝날 때 열린 거북목 구간 마무리
    if (turtleStartTimeRef.current != null) {
      const now = v.currentTime ?? 0;
      const start = turtleStartTimeRef.current;
      const end = Math.max(now, start);
      const duration = end - start;
      setTurtleNeckPeriods((prev) => [...prev, { start, end, duration }]);
      turtleStartTimeRef.current = null;
    }

    v.pause();
    v.currentTime = 0;
    setRunning(false);
    setStatus("idle");
    setFps(0);
    resetTimestamps();
    stopLoop();
  }

  function onVideoEnded() {
    setRunning(false);
    // 끝날 때 열린 구간 닫기
    const v = videoRef.current!;
    if (turtleStartTimeRef.current != null) {
      const end = v.duration ?? v.currentTime ?? 0;
      const start = turtleStartTimeRef.current;
      const duration = Math.max(end - start, 0);
      setTurtleNeckPeriods((prev) => [...prev, { start, end, duration }]);
      turtleStartTimeRef.current = null;
    }
    resetTimestamps();
  }

  // ====== CSV/저장 유틸 ======
  function downloadCSVLog() {
    const blob = new Blob([logRows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "turtleneck_video_log.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function buildPeriodsCSV(periods: Period[]) {
    const header = "start_time,end_time,duration";
    const lines = periods.map((p) => [p.start.toFixed(2), p.end.toFixed(2), p.duration.toFixed(2)].join(","));
    return [header, ...lines].join("\n");
  }

  function downloadPeriodsCSV() {
    const csv = buildPeriodsCSV(turtleNeckPeriods);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "turtleneck_periods.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadSessionJSON() {
    const v = videoRef.current;
    const payload = {
      savedAt: new Date().toISOString(),
      videoDuration: v?.duration ?? null,
      testInfo,
      turtleNeckPeriods,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "turtleneck_session.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function saveToServerFiles() {
    try {
      const csv = buildPeriodsCSV(turtleNeckPeriods);
      const v = videoRef.current;

      const payload = {
        savedAt: new Date().toISOString(),
        videoDuration: v?.duration ?? null,
        testInfo,
        turtleNeckPeriods,
        csv, // 서버에서도 같이 저장
      };

      const res = await fetch("/api/posture-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save on server");
      }

      const data = await res.json();
      alert(
        `서버에 저장 완료!\nJSON: ${data.jsonPath}\nCSV: ${data.csvPath}\n(호스팅 환경에 따라 경로는 임시일 수 있어요)`
      );
    } catch (err: any) {
      console.error(err);
      alert(`서버 저장 실패: ${err.message ?? String(err)}`);
    }
  }

  // ====== testInfo UI 핸들러 ======
  function updateTestInfo<K extends keyof TestInfo>(key: K, value: TestInfo[K]) {
    setTestInfo((prev) => ({ ...prev, [key]: value }));
  }

  function saveTestData() {
    const entry = { ...testInfo, savedAt: new Date().toISOString() };
    setSavedTestInfos((prev) => [entry, ...prev]);
    // 원하면 localStorage에 유지
    try {
      const prevRaw = localStorage.getItem("turtleneck_testinfos");
      const prevArr: any[] = prevRaw ? JSON.parse(prevRaw) : [];
      localStorage.setItem("turtleneck_testinfos", JSON.stringify([entry, ...prevArr]));
    } catch {}
  }

  useEffect(() => {
    // 초기 로드 시 localStorage에서 불러오기(선택)
    try {
      const prevRaw = localStorage.getItem("turtleneck_testinfos");
      if (prevRaw) setSavedTestInfos(JSON.parse(prevRaw));
    } catch {}
  }, []);

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
            <input
              type="file"
              accept="video/*"
              onChange={onPickFile}
              className="
    block w-full cursor-pointer
    rounded-2xl border-2 border-dashed border-slate-300
    bg-white/70 p-6 text-sm shadow-sm
    transition
    hover:border-slate-400 hover:bg-white
    focus:outline-none focus:ring-4 focus:ring-slate-200/60

    /* 파일 버튼 커스터마이즈 */
    file:mr-4 file:rounded-md
    file:border-0 file:bg-black file:px-4 file:py-2 file:text-white
    hover:file:bg-slate-800
    file:transition
  "
            />

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

            {/* ===== 테스트 정보 입력 ===== */}
            <div className="space-y-4 mt-4">
              <div className="p-4 border rounded-2xl">
                <h3 className="font-semibold mb-3">테스트 정보 입력</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">모니터와의 거리 (cm)</label>
                    <input
                      type="number"
                      value={testInfo.monitorDistance}
                      onChange={(e) => updateTestInfo("monitorDistance", Number(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">모니터 높이 (cm)</label>
                    <input
                      type="number"
                      value={testInfo.monitorHight}
                      onChange={(e) => updateTestInfo("monitorHight", Number(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">카메라와의 각도 (deg)</label>
                    <input
                      type="number"
                      value={testInfo.angleBetweenBodyAndCam}
                      onChange={(e) => updateTestInfo("angleBetweenBodyAndCam", Number(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="hair"
                      type="checkbox"
                      checked={testInfo.isHairTied}
                      onChange={(e) => updateTestInfo("isHairTied", e.target.checked)}
                    />
                    <label htmlFor="hair" className="text-sm">
                      머리 묶음 여부
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">거북목 레벨</label>
                    <select
                      value={testInfo.turtleNeckLevel}
                      onChange={(e) => updateTestInfo("turtleNeckLevel", e.target.value as TestInfo["turtleNeckLevel"])}
                      className="w-full p-2 border rounded"
                    >
                      <option value="none">none</option>
                      <option value="mild">mild</option>
                      <option value="severe">severe</option>
                    </select>
                  </div>

                  <button
                    onClick={saveTestData}
                    className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600"
                  >
                    테스트 정보 저장
                  </button>
                </div>
              </div>
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

            <div className="mt-4 space-y-2">
              <button
                onClick={downloadCSVLog}
                disabled={logRows.length <= 1}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 disabled:opacity-40"
              >
                Download CSV log
              </button>

              <div className="flex gap-2">
                <button
                  onClick={downloadPeriodsCSV}
                  disabled={turtleNeckPeriods.length === 0}
                  className="rounded-xl bg-indigo-600 text-white px-4 py-2 disabled:opacity-40"
                >
                  Download Turtle Periods CSV
                </button>
                <button onClick={downloadSessionJSON} className="rounded-xl bg-slate-800 text-white px-4 py-2">
                  Download Session JSON
                </button>
              </div>

              {/* <button onClick={saveToServerFiles} className="rounded-xl bg-amber-600 text-white px-4 py-2">
                서버에 파일 저장(개발/자체 호스팅용)
              </button> */}
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Processing occurs during playback; seek/scrub is supported.</p>
            <p>• Landmarks used: 7, 8, 11, 12 → fed into your isTurtleNeck().</p>
            <p>• Timestamps are strictly monotonic to satisfy MediaPipe VIDEO mode.</p>
          </div>

          {/* ===== 저장된 TestInfo 리스트 ===== */}
          <div className="p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-2">저장된 테스트 정보</h3>
            {savedTestInfos.length === 0 ? (
              <p className="text-sm text-slate-500">아직 저장된 항목이 없습니다.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {savedTestInfos.map((t, i) => (
                  <li key={i} className="p-2 border rounded-xl">
                    <div className="text-xs text-slate-500">{t.savedAt}</div>
                    <div>
                      거리: {t.monitorDistance} cm, 높이: {t.monitorHight} cm, 각도: {t.angleBetweenBodyAndCam}°
                    </div>
                    <div>
                      머리 묶음: {t.isHairTied ? "예" : "아니오"}, 레벨: {t.turtleNeckLevel}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ===== 거북목 구간 표 & CSV 텍스트 미리보기 ===== */}
          <div className="p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-2">거북목 구간 (start, end, duration)</h3>
            {turtleNeckPeriods.length === 0 ? (
              <p className="text-sm text-slate-500">추출된 구간이 없습니다.</p>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">#</th>
                      <th className="text-left py-1">start</th>
                      <th className="text-left py-1">end</th>
                      <th className="text-left py-1">duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turtleNeckPeriods.map((p, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-1">{i + 1}</td>
                        <td className="py-1">{p.start.toFixed(2)}s</td>
                        <td className="py-1">{p.end.toFixed(2)}s</td>
                        <td className="py-1">{p.duration.toFixed(2)}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-3">
                  <label className="block text-xs text-slate-500 mb-1">CSV 미리보기</label>
                  <pre className="text-xs p-2 bg-slate-50 rounded-xl overflow-auto">
                    {`start_time,end_time,duration
${turtleNeckPeriods.map((p) => `${p.start.toFixed(2)},${p.end.toFixed(2)},${p.duration.toFixed(2)}`).join("\n")}`}
                  </pre>
                </div>
              </>
            )}
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
            onEnded={onVideoEnded}
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
