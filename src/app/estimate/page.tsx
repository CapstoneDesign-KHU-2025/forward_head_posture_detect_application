"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import analyzeTurtleNeck from "@/utils/isTurtleNeck";
import turtleStabilizer from "@/utils/turtleStabilizer";
import { getSensitivity } from "@/utils/sensitivity";

import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { getTodayHourly, computeTodaySoFarAverage, finalizeUpToNow } from "@/lib/hourlyOps";
import { useClearPostureDBOnLoad } from "@/hooks/useClearDBOnload";
import { useAppStore } from "../store/app";
import { useSession } from "next-auth/react";
import { getTodayCount } from "@/lib/postureLocal";
import { clear } from "console";
import { Bug } from "lucide-react";

export default function Estimate() {
  const { data: session, status } = useSession();

  // 🔹 카메라 / 포즈 관련 ref들 (첫 번째 파일 로직)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const lastStateRef = useRef<boolean | null>(null);
  const lastBeepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const poseBufferRef = useRef<any[]>([]);
  const lastBufferTimeRef = useRef<number>(performance.now());

  const countdownStartRef = useRef<number | null>(null);
  const measuringRef = useRef<boolean>(false);
  const lastGuideMessageRef = useRef<string | null>(null);
  const lastGuideColorRef = useRef<"green" | "red" | "orange">("red");

  // 🔹 상태값들 (UI + 측정)
  const [isTurtle, setIsTurtle] = useState(false);
  const [angle, setAngle] = useState(0);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);
  const [guideColor, setGuideColor] = useState<"green" | "red" | "orange">("red");
  const [countdownRemain, setCountdownRemain] = useState<number | null>(null);
  const [measurementStarted, setMeasurementStarted] = useState<boolean>(false);
  const [showMeasurementStartedToast, setShowMeasurementStartedToast] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 통계/서버 관련 상태 (두 번째 파일 로직)
  const [hourlyList, setHourlyList] = useState<any[]>([]);
  const [todayAvg, setTodayAvg] = useState<number | null>(null);
  const [isHourlyVisible, setIsHourlyVisible] = useState(false);
  const [isTodayAvgVisible, setIsTodayAvgVisible] = useState(false);
  const [stopEstimating, setStopEstimating] = useState(false);
  const turtleNeckNumberInADay = useAppStore((s) => s.turtleNeckNumberInADay);

  // 🔹 각도/거북목 상태를 기반으로 IndexedDB에 10초 단위 저장하는 훅
  const userId = (session?.user as any)?.id as string | undefined;

  const sessionIdRef = useRef<string | null>(null);
  if (!sessionIdRef.current) {
    sessionIdRef.current = `measure-${userId ?? "guest"}-${Date.now()}`;
  }
  const sessionId = sessionIdRef.current;

  if (!userId || !sessionId) return <div>loading</div>;

  usePostureStorageManager(userId, angle, isTurtle, sessionId);

  // 🔹 "거북목 측정을 시작합니다" 토스트 자동 숨김
  useEffect(() => {
    if (!showMeasurementStartedToast) return;
    const timer = setTimeout(() => setShowMeasurementStartedToast(false), 1500);
    return () => clearTimeout(timer);
  }, [showMeasurementStartedToast]);

  // 🔹 Mediapipe 초기화 + 메인 루프
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.playsInline = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;

        await new Promise<void>((res) => {
          const onReady = () => {
            video.removeEventListener("loadedmetadata", onReady);
            video.removeEventListener("canplay", onReady);
            res();
          };
          video.addEventListener("loadedmetadata", onReady, { once: true });
          video.addEventListener("canplay", onReady, { once: true });
        });

        await video.play();
        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
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

        if (cancelled) return;

        const loop = async () => {
          const v = videoRef.current;
          const c = canvasRef.current;
          const lm = landmarkerRef.current;

          if (!lm || !v || !c || v.videoWidth === 0 || v.videoHeight === 0) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
          }

          const nowPerformance = performance.now();
          const result = lm.detectForVideo(v, nowPerformance);
          const ctx = c.getContext("2d")!;

          ctx.clearRect(0, 0, c.width, c.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(v, -c.width, 0, c.width, c.height);
          ctx.restore();

          const poses = result.landmarks ?? [];

          if (stopEstimating) {
            measuringRef.current = false;
            countdownStartRef.current = null;
            lastGuideMessageRef.current = null;
            setGuideMessage(null);
            setCountdownRemain(null);
            setIsTurtle(false);
            lastStateRef.current = null;
            setAngle(0);

            if (lastBeepIntervalRef.current) {
              clearInterval(lastBeepIntervalRef.current);
              lastBeepIntervalRef.current = null;
            }

            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          const centerX = c.width / 2;
          const centerY = c.height / 2;
          const offsetY = 30;

          // --- 가이드라인 내부 체크 함수들 ---
          const isInsideFaceGuideline = (x: number, y: number) => {
            const pixelX = x * c.width;
            const pixelY = y * c.height;

            const faceCenterX = centerX;
            const faceCenterY = centerY - 80 + offsetY;
            const radiusX = 90;
            const radiusY = 110;

            const dx = (pixelX - faceCenterX) / radiusX;
            const dy = (pixelY - faceCenterY) / radiusY;
            return dx * dx + dy * dy <= 1;
          };

          const isInsideUpperBodyGuideline = (x: number, y: number) => {
            const pixelX = x * c.width;
            const pixelY = y * c.height;

            const leftBound = centerX - 225;
            const rightBound = centerX + 225;
            const topBound = centerY + 60 + offsetY;
            const bottomBound = centerY + 280 + offsetY;

            return pixelX >= leftBound && pixelX <= rightBound && pixelY >= topBound && pixelY <= bottomBound;
          };

          let faceInside = true;
          let shoulderInside = true;
          let isDistanceOk = true;
          let distanceRatio = 1;

          const tooCloseThreshold = 1.05;
          const tooFarThreshold = 0.7;

          if (poses.length > 0) {
            const pose = poses[0];
            poseBufferRef.current.push({
              earLeft: { x: pose[7].x, y: pose[7].y, z: pose[7].z },
              earRight: { x: pose[8].x, y: pose[8].y, z: pose[8].z },
              shoulderLeft: { x: pose[11].x, y: pose[11].y, z: pose[11].z },
              shoulderRight: { x: pose[12].x, y: pose[12].y, z: pose[12].z },
            });

            const faceLandmarks = pose.slice(0, 11);
            if (faceLandmarks.length > 0) {
              faceInside = faceLandmarks.every((lm: any) => isInsideFaceGuideline(lm.x, lm.y));
            }

            const shoulderLandmarks = pose.slice(11, 13);
            if (shoulderLandmarks.length > 0) {
              shoulderInside = shoulderLandmarks.every((lm: any) => isInsideUpperBodyGuideline(lm.x, lm.y));
            }

            const lm11 = pose[11];
            const lm12 = pose[12];

            if (lm11 && lm12) {
              const shoulderWidth = Math.sqrt(
                Math.pow((lm12.x - lm11.x) * c.width, 2) + Math.pow((lm12.y - lm11.y) * c.height, 2)
              );

              const referenceShoulderWidth = 380;
              distanceRatio = shoulderWidth / referenceShoulderWidth;

              isDistanceOk = distanceRatio >= tooFarThreshold && distanceRatio <= tooCloseThreshold;
            }
          }

          const allInside = faceInside && shoulderInside && isDistanceOk;
          let nextGuideMessage: string | null = null;
          let nextGuideColor: "green" | "red" | "orange" = lastGuideColorRef.current ?? "red";
          let nextCountdownRemain: number | null = null;

          // --- 측정 시작 전: 가이드 + 카운트다운 ---
          if (!measuringRef.current) {
            nextGuideMessage = "가이드라인 안으로 들어오세요";
            nextGuideColor = "red";

            if (!isDistanceOk) {
              if (distanceRatio >= tooCloseThreshold) {
                nextGuideMessage = "너무 가까워요";
                nextGuideColor = "orange";
              } else if (distanceRatio <= tooFarThreshold) {
                nextGuideMessage = "너무 멀어요";
                nextGuideColor = "orange";
              }
              countdownStartRef.current = null;
            } else if (allInside) {
              if (!countdownStartRef.current) {
                countdownStartRef.current = nowPerformance;
              }

              const elapsed = nowPerformance - countdownStartRef.current;
              const remain = Math.max(0, 3000 - elapsed);
              nextCountdownRemain = Math.ceil(remain / 1000);

              if (elapsed >= 3000) {
                measuringRef.current = true;
                setMeasurementStarted(true);
                setShowMeasurementStartedToast(true);

                nextGuideMessage = null;
                nextGuideColor = "green";
                nextCountdownRemain = null;
                countdownStartRef.current = null;
                lastGuideMessageRef.current = null;
                setGuideMessage(null);
              } else {
                nextGuideMessage = `좋아요! ${nextCountdownRemain}초 유지하세요`;
                nextGuideColor = "green";
              }
            } else {
              countdownStartRef.current = null;
            }
          }

          // 가이드 메시지/색상 업데이트
          if (!measuringRef.current) {
            if (lastGuideMessageRef.current !== nextGuideMessage) {
              lastGuideMessageRef.current = nextGuideMessage;
              setGuideMessage(nextGuideMessage);
            }
            if (lastGuideColorRef.current !== nextGuideColor) {
              lastGuideColorRef.current = nextGuideColor;
              setGuideColor(nextGuideColor);
            }
            setCountdownRemain(nextCountdownRemain);
          } else {
            if (lastGuideMessageRef.current !== null) {
              lastGuideMessageRef.current = null;
              setGuideMessage(null);
            }
            setCountdownRemain(null);
          }

          // --- 미측정 상태: 가이드라인 그리기 ---
          if (!measuringRef.current) {
            const guidelineColor = allInside ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 0, 0, 0.6)";

            ctx.save();
            ctx.strokeStyle = guidelineColor;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // 얼굴
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - 80 + offsetY, 90, 110, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 목
            ctx.beginPath();
            ctx.moveTo(centerX - 40, centerY + 10 + offsetY);
            ctx.lineTo(centerX - 35, centerY + 40 + offsetY);
            ctx.moveTo(centerX + 40, centerY + 10 + offsetY);
            ctx.lineTo(centerX + 35, centerY + 40 + offsetY);
            ctx.stroke();

            // 어깨
            ctx.beginPath();
            ctx.moveTo(centerX - 35, centerY + 40 + offsetY);
            ctx.lineTo(centerX - 190, centerY + 60 + offsetY);
            ctx.moveTo(centerX + 35, centerY + 40 + offsetY);
            ctx.lineTo(centerX + 190, centerY + 60 + offsetY);
            ctx.stroke();

            // 상체
            ctx.beginPath();
            ctx.moveTo(centerX - 190, centerY + 60 + offsetY);
            ctx.bezierCurveTo(
              centerX - 200,
              centerY + 150 + offsetY,
              centerX - 215,
              centerY + 220 + offsetY,
              centerX - 225,
              centerY + 280 + offsetY
            );

            ctx.moveTo(centerX + 190, centerY + 60 + offsetY);
            ctx.bezierCurveTo(
              centerX + 200,
              centerY + 150 + offsetY,
              centerX + 215,
              centerY + 220 + offsetY,
              centerX + 225,
              centerY + 280 + offsetY
            );

            ctx.moveTo(centerX - 225, centerY + 280 + offsetY);
            ctx.lineTo(centerX + 225, centerY + 280 + offsetY);
            ctx.stroke();

            ctx.restore();
          }

          // --- 측정 시작 후: 거북목 계산 + 경고음 ---
          for (const pose of poses) {
            const now = performance.now();
            if (!measuringRef.current) {
              lastBufferTimeRef.current = now;
              poseBufferRef.current = [];
              continue;
            }

            if (now - lastBufferTimeRef.current >= 200) {
              lastBufferTimeRef.current = now;

              const buf = poseBufferRef.current;
              poseBufferRef.current = [];

              const avg = (key: "earLeft" | "earRight" | "shoulderLeft" | "shoulderRight") => {
                return {
                  x: buf.reduce((a,b)=>a+b[key].x, 0) / buf.length,
                  y: buf.reduce((a,b)=>a+b[key].y, 0) / buf.length,
                  z: buf.reduce((a,b)=>a+b[key].z, 0) / buf.length,
                };
              };

              const lm7 = avg("earLeft");
              const lm8 = avg("earRight");
              const lm11 = avg("shoulderLeft");
              const lm12 = avg("shoulderRight");

              // 민감도 설정 가져오기
              const sensitivity = getSensitivity();

              const turtleData = analyzeTurtleNeck({
                earLeft: { x: lm7["x"], y: lm7["y"], z: lm7["z"] },
                earRight: { x: lm8["x"], y: lm8["y"], z: lm8["z"] },
                shoulderLeft: { x: lm11["x"], y: lm11["y"], z: lm11["z"] },
                shoulderRight: { x: lm12["x"], y: lm12["y"], z: lm12["z"] },
                sensitivity,
              });

              const result = turtleStabilizer(turtleData.angleDeg, sensitivity);

              let turtleNow = lastStateRef.current ?? false;
              let avgAngle = 0;

              if (result !== null) {
                avgAngle = result.avgAngle;
                turtleNow = result.isTurtle;
                setAngle(avgAngle);
              }

              if (turtleNow !== lastStateRef.current) {
                setIsTurtle(turtleNow);
                lastStateRef.current = turtleNow;

                if (turtleNow) {
                  const beepInterval = setInterval(() => {
                    const audioCtx = new AudioContext();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.2);
                    setTimeout(() => audioCtx.close(), 300);
                  }, 1000);
                  lastBeepIntervalRef.current = beepInterval;
                } else {
                  if (lastBeepIntervalRef.current) {
                    clearInterval(lastBeepIntervalRef.current);
                    lastBeepIntervalRef.current = null;
                  }
                }
              }
            }
          }

          rafRef.current = requestAnimationFrame(loop);
        };

        loop();
      } catch (e: any) {
        console.error("Camera / Mediapipe init error:", e);
        setError(e?.message ?? "카메라 초기화 중 오류가 발생했습니다.");
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (lastBeepIntervalRef.current) {
        clearInterval(lastBeepIntervalRef.current);
        lastBeepIntervalRef.current = null;
      }

      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, [stopEstimating]);

  // 🔹 "오늘의 측정 중단하기" 버튼: IndexedDB -> DailyPostureSummary POST
  const handleStopEstimating = async () => {
    try {
      if (!stopEstimating) {
        const rows = await getTodayHourly(userId);

        const dailySumWeighted = rows?.reduce((acc: number, r: any) => acc + (r?.sumWeighted ?? 0), 0) ?? 0;
        const dailyWeightSeconds = rows?.reduce((acc: number, r: any) => acc + (r?.weight ?? 0), 0) ?? 0;
        const count = await getTodayCount(userId);
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const dateISO = `${yyyy}-${mm}-${dd}`;

        await fetch("/api/summaries/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            dateISO,
            sumWeighted: dailySumWeighted,
            weightSeconds: dailyWeightSeconds,
            count: count,
          }),
        });
      } else {
        // 측정 시작: 모든 기존 측정 상태 리셋
        measuringRef.current = false;
        countdownStartRef.current = null;
        lastGuideMessageRef.current = null;
        setGuideMessage("가이드라인 안으로 들어오세요");
        setGuideColor("red");
        setMeasurementStarted(false);
        setCountdownRemain(null);
        setIsTurtle(false);
      }
    } catch (err) {
      console.error("[handleStopEstimating] error:", err);
    } finally {
      setStopEstimating((prev) => !prev);
    }
  };

  // 🔹 시간별 평균 토글
  async function toggleHourly() {
    if (isHourlyVisible) {
      setIsHourlyVisible(false);
      return;
    }
    // 다른 토글 비활성화
    setIsTodayAvgVisible(false);
    if (userId) {
      const rows = await getTodayHourly(userId);
      setHourlyList(rows);
      setIsHourlyVisible(true);
    }
  }
  // 🔹 오늘 지금까지 평균 토글
  async function toggleAvg() {
    if (isTodayAvgVisible) {
      setIsTodayAvgVisible(false);
      return;
    }
    // 다른 토글 비활성화
    setIsHourlyVisible(false);
    const avg = await computeTodaySoFarAverage(userId);
    setTodayAvg(avg);
    if (userId) await finalizeUpToNow(userId, true);
    setIsTodayAvgVisible(true);
  }

  // 상태 배너 타입 결정
  const getStatusBannerType = (): "success" | "warning" | "info" => {
    if (stopEstimating) return "info";
    if (isTurtle && measurementStarted) return "warning";
    if (guideColor === "green" && guideMessage) return "success";
    if (guideColor === "orange" && guideMessage) return "info";
    if (guideColor === "red" && guideMessage) return "info";
    return "success";
  };

  const statusBannerMessage = () => {
    if (stopEstimating) return "측정이 중단되었습니다";
    if (isTurtle && measurementStarted) return `거북목 자세입니다!`;
    if (guideMessage) return guideMessage;
    return "바른 자세입니다!";
  };

  // 시간 포맷팅 함수
  const formatTimeRange = (hourStartTs: number) => {
    const start = new Date(hourStartTs);
    const end = new Date(hourStartTs + 3600000);
    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "오후" : "오전";
      const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${period} ${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };
    return `${formatTime(start)} ~ ${formatTime(end)}`;
  };

  // 🔹 UI
  return (
    <div className="min-h-screen bg-[#F8FBF8]">
      <div className="max-w-[1200px] mx-auto px-70 py-8">
        {/* 측정 중단 버튼 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleStopEstimating}
            className="px-12 py-4 bg-[#1A1A1A] text-white border-none rounded-xl text-[1.1rem] font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#374151] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]"
          >
            {stopEstimating ? "측정 시작하기" : "오늘의 측정 중단하기"}
          </button>
        </div>

        {/* 측정 섹션 */}
        <section className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_30px_rgba(45,95,46,0.1)]">
          <div className="p-0">
            {/* 상태 배너 */}
            <div
              className={`w-full px-8 py-4 text-center text-[1.1rem] font-semibold transition-all duration-300 rounded-t-[20px] ${
                getStatusBannerType() === "success"
                  ? "bg-gradient-to-r from-[#4A9D4D] to-[#66BB6A] text-white"
                  : getStatusBannerType() === "warning"
                  ? "bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white"
                  : "bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white"
              }`}
            >
              {statusBannerMessage()}
            </div>

            {/* 카메라 컨테이너 */}
            <div className="relative w-full m-0 rounded-none overflow-hidden bg-[#2C3E50]" style={{ aspectRatio: '4/3' }}>
              {/* 비디오는 숨기고, 캔버스만 화면에 표시 */}
              <video ref={videoRef} className="absolute -left-[9999px]" />
              <canvas ref={canvasRef} className="w-full h-full block bg-[#2C3E50]" />

              {/* 측정 시작 토스트 */}
              {showMeasurementStartedToast && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(64, 64, 64, 0.85)",
                    color: "white",
                    padding: "16px 28px",
                    borderRadius: "9999px",
                    fontWeight: "bold",
                    fontSize: "20px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
                    pointerEvents: "none",
                    zIndex: 1000,
                  }}
                >
                  거북목 측정을 시작합니다
                </div>
              )}

              {/* 3초 카운트다운 */}
              {countdownRemain !== null && !measurementStarted && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "9999px",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  {countdownRemain}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 토글 버튼 (웹캠 박스 밖) */}
        <div className="flex justify-center gap-4 my-6">
          <button
            onClick={toggleHourly}
            className={`px-8 py-3 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 ${
              isHourlyVisible
                ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white border-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-[#E8F5E9] bg-white text-[#4F4F4F] hover:border-[#7BC67E] hover:bg-[#F8FBF8] hover:text-[#2D5F2E]"
            }`}
          >
            {isHourlyVisible ? "⏱️ 시간별 평균 숨기기" : "⏱️ 시간별 평균 보기"}
          </button>
          <button
            onClick={toggleAvg}
            className={`px-8 py-3 border-2 rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 ${
              isTodayAvgVisible
                ? "bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white border-[#F59E0B] shadow-[0_2px_10px_rgba(245,158,11,0.3)]"
                : "border-[#E8F5E9] bg-white text-[#4F4F4F] hover:border-[#7BC67E] hover:bg-[#F8FBF8] hover:text-[#2D5F2E]"
            }`}
          >
            {isTodayAvgVisible ? "📊 지금까지 평균 숨기기" : "📊 지금까지 평균 계산"}
          </button>
        </div>

        {/* 통계 섹션 - 시간별 평균 */}
        {isHourlyVisible && hourlyList.length > 0 && (
          <div className="mt-6" style={{ animation: "slideDown 0.3s ease" }}>
            <div className="flex flex-col gap-4">
              {hourlyList.map((r) => (
                <div
                  key={r.userId + "-" + r.hourStartTs}
                  className="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] border-l-4 border-[#4A9D4D]"
                >
                  <div className="text-[1.1rem] font-semibold text-[#2D5F2E] mb-2">
                    {formatTimeRange(r.hourStartTs)}
                  </div>
                  <div className="text-[0.9rem] text-[#4F4F4F] mb-1">
                    count: {r.count}, weight: {r.weight.toFixed(0)}s
                  </div>
                  <div className="text-[1.5rem] font-bold text-[#2D5F2E]">
                    avg:{" "}
                    {r.finalized === 1 && r.avgAngle != null
                      ? r.avgAngle.toFixed(2)
                      : (r.sumWeighted / Math.max(1, r.weight)).toFixed(2)}
                    °{" "}
                    <span className="inline-block px-3 py-1 bg-[#E8F5E9] text-[#2D5F2E] rounded-md text-[0.85rem] font-semibold ml-2">
                      {r.finalized === 1 ? "확정" : "진행 중"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 통계 섹션 - 지금까지 평균 */}
        {isTodayAvgVisible && todayAvg != null && (
          <div className="mt-6" style={{ animation: "slideDown 0.3s ease" }}>
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(45,95,46,0.1)] text-center border-[3px] border-[#4A9D4D]">
              <div className="text-[1.1rem] text-[#4F4F4F] mb-4">오늘 지금까지 평균:</div>
              <div className="text-[3rem] font-bold text-[#2D5F2E]">{todayAvg.toFixed(2)}°</div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-6 p-6 bg-[#FFF9E6] rounded-xl border-l-4 border-[#F59E0B]">
            <p className="text-[#92400E] leading-relaxed">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
