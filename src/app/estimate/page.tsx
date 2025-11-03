"use client";

import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import analyzeTurtleNeck from "@/utils/isTurtleNeck";
import turtleStabilizer from "@/utils/turtleStabilizer";

export default function Estimate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  const lastSendTimeRef = useRef<number>(0);
  const lastStateRef = useRef<boolean | null>(null);
  const lastBeepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [ isTurtle, setIsTurtle ] = useState(false);
  const [ angle, setAngle ] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const video = videoRef.current!;
      video.muted = true;
      video.playsInline = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
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
        const v = videoRef.current!;
        const c = canvasRef.current!;
        const lm = landmarkerRef.current;

        if (!lm || v.videoWidth === 0 || v.videoHeight === 0) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
          c.width = v.videoWidth;
          c.height = v.videoHeight;
        }

        const result = lm.detectForVideo(v, performance.now());
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(v, 0, 0, c.width, c.height);

        const poses = result.landmarks ?? [];
        const utils = new DrawingUtils(ctx);
        const conns = PoseLandmarker.POSE_CONNECTIONS;

        for (const pose of poses) {
        // 랜드마크 그리기
        //   const utils = new DrawingUtils(ctx);
        //   utils.drawConnectors(pose as any, conns, { lineWidth: 2 });
        //   utils.drawLandmarks(pose as any, { radius: 3 });

          const now = Date.now();
          if (now - lastLogTimeRef.current >= 200) {
            const lm7 = pose[7];
            const lm8 = pose[8];
            const lm11 = pose[11];
            const lm12 = pose[12];
            // 7, 8, 11, 12번 랜드마크 좌표 출력
            // console.log("Landmark 7:", lm7);
            // console.log("Landmark 8:", lm8);
            // console.log("Landmark 11:", lm11);
            // console.log("Landmark 12:", lm12);
            lastLogTimeRef.current = now;
            const turtleData = analyzeTurtleNeck(
              { x: lm7["x"], y: lm7["y"], z: lm7["z"] },
              { x: lm8["x"], y: lm8["y"], z: lm8["z"] },
              { x: lm11["x"], y: lm11["y"], z: lm11["z"] },
              { x: lm12["x"], y: lm12["y"], z: lm12["z"] }
            );

            const result = turtleStabilizer(turtleData.angleDeg);

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

                console.log(
                    `평균각도: ${avgAngle.toFixed(2)}° → ${
                    turtleNow ? " 거북목" : " 정상"
                    }`
                );

                if (turtleNow) {
                    console.log("거북목 상태 감지 - 경고 시작");

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
                    console.log("정상 상태 복귀 - 경고 중단");

                    if (lastBeepIntervalRef.current) {
                        clearInterval(lastBeepIntervalRef.current);
                        lastBeepIntervalRef.current = null;
                    }
                }
            }


            const lastSend = lastSendTimeRef.current;

            if (now - lastSend >= 2000) {
              // 2초마다 Next.js API로 결과 전송
              try {
                await fetch("/api/save", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    user_id: "jun_huh",
                    angle: turtleData["angleDeg"] ?? 0,
                    is_turtle: turtleData["isTurtle"],
                    landmarks: pose.slice(1, 13).map((p) => ({ x: p.x, y: p.y, z: p.z })),
                  }),
                });
                lastSendTimeRef.current = now;
              } catch(err) {
                console.error("데이터 전송 실패:", err);
              }
            }
            lastLogTimeRef.current = now;
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      loop();
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close?.();
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks() || [];
      tracks.forEach((t) => t.stop());
    };
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <video ref={videoRef} style={{ position: "absolute", left: -9999 }} />
      <canvas ref={canvasRef} />

      {isTurtle && (
        <div
            style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(255,0,0,0.8)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "18px",
            }}
        >
            거북목 자세입니다! ({angle.toFixed(1)}°)
        </div>
      )}
    </div>
  );
}
