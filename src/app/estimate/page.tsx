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

        // 가이드라인
        const centerX = c.width / 2;
        const centerY = c.height / 2;
        const offsetY = 30;

        const poses = result.landmarks ?? [];
        
        // 얼굴 가이드라인 영역 체크 함수 (타원 내부)
        const isInsideFaceGuideline = (x: number, y: number) => {
          const pixelX = x * c.width;
          const pixelY = y * c.height;
          
          // 얼굴 타원: 중심 (centerX, centerY - 80 + offsetY), 반지름 90x110
          const faceCenterX = centerX;
          const faceCenterY = centerY - 80 + offsetY;
          const radiusX = 90;
          const radiusY = 110;
          
          // 타원 내부인지 체크: ((x-h)²/a²) + ((y-k)²/b²) <= 1
          const dx = (pixelX - faceCenterX) / radiusX;
          const dy = (pixelY - faceCenterY) / radiusY;
          return dx * dx + dy * dy <= 1;
        };
        
        // 어깨/상반신 가이드라인 영역 체크 함수 (어깨선부터 상체 아래까지, 목 제외)
        const isInsideUpperBodyGuideline = (x: number, y: number) => {
          const pixelX = x * c.width;
          const pixelY = y * c.height;
          
          // 상반신 영역: 어깨선(centerY + 60 + offsetY)부터 상체 아래(centerY + 280 + offsetY)까지
          const leftBound = centerX - 225;
          const rightBound = centerX + 225;
          const topBound = centerY + 60 + offsetY; // 어깨선
          const bottomBound = centerY + 280 + offsetY; // 상체 아래
          
          return pixelX >= leftBound && pixelX <= rightBound && 
                 pixelY >= topBound && pixelY <= bottomBound;
        };

        let faceInside = true;
        let shoulderInside = true;
        let isDistanceOk = true; // 거리도 적절한지 체크
        let distanceRatio = 1; // 거리 비율 (기본값)
        let distanceMessage = "";
        let distanceColor = "";
        
        // 임계값 설정
        const tooCloseThreshold = 1.05; // 105% 이상이면 너무 가까움
        const tooFarThreshold = 0.7;   // 70% 이하면 너무 멀음
        
        if (poses.length > 0) {
          const pose = poses[0];
          
          // 얼굴 랜드마크 체크 (0-10번)
          const faceLandmarks = pose.slice(0, 11);
          if (faceLandmarks.length > 0) {
            faceInside = faceLandmarks.every((lm: any) => isInsideFaceGuideline(lm.x, lm.y));
          }
          
          // 어깨 랜드마크 체크 (11-12번)
          const shoulderLandmarks = pose.slice(11, 13);
          if (shoulderLandmarks.length > 0) {
            shoulderInside = shoulderLandmarks.every((lm: any) => isInsideUpperBodyGuideline(lm.x, lm.y));
          }
          
          // 거리 체크
          const lm11 = pose[11]; // 왼쪽 어깨
          const lm12 = pose[12]; // 오른쪽 어깨
          
          if (lm11 && lm12) {
            // 어깨 너비 계산 (픽셀)
            const shoulderWidth = Math.sqrt(
              Math.pow((lm12.x - lm11.x) * c.width, 2) + 
              Math.pow((lm12.y - lm11.y) * c.height, 2)
            );
            
            // 기준 어깨 너비 (가이드라인 기준: 190 + 190 = 380px)
            const referenceShoulderWidth = 380;
            
            // 거리 비율 계산 (실제 너비 / 기준 너비)
            distanceRatio = shoulderWidth / referenceShoulderWidth;
            
            // 거리가 적절한 범위 안에 있는지 체크
            isDistanceOk = distanceRatio >= tooFarThreshold && distanceRatio <= tooCloseThreshold;
            
            // 거리 메시지 설정
            if (distanceRatio >= tooCloseThreshold) {
              distanceMessage = "너무 가깝습니다. 뒤로 물러나세요.";
              distanceColor = "rgba(255, 0, 0, 0.9)";
            } else if (distanceRatio <= tooFarThreshold) {
              distanceMessage = "너무 멉니다. 앞으로 이동하세요.";
              distanceColor = "rgba(255, 165, 0, 0.9)";
            } else {
              distanceMessage = "적절한 거리입니다.";
              distanceColor = "rgba(0, 255, 0, 0.9)";
            }
          }
        }
        
        // 랜드마크가 안에 있고 거리도 적절해야 초록색, 하나라도 실패하면 빨간색
        const allInside = faceInside && shoulderInside && isDistanceOk;
        const guidelineColor = allInside ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)';
        
        ctx.save();
        ctx.strokeStyle = guidelineColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
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
          centerX - 200, centerY + 150 + offsetY,
          centerX - 215, centerY + 220 + offsetY,
          centerX - 225, centerY + 280 + offsetY
        );
        
        ctx.moveTo(centerX + 190, centerY + 60 + offsetY);
        ctx.bezierCurveTo(
          centerX + 200, centerY + 150 + offsetY,
          centerX + 215, centerY + 220 + offsetY,
          centerX + 225, centerY + 280 + offsetY
        );
        
        // 하단 연결
        ctx.moveTo(centerX - 225, centerY + 280 + offsetY);
        ctx.lineTo(centerX + 225, centerY + 280 + offsetY);
        ctx.stroke();
        
        ctx.restore();

        const conns = PoseLandmarker.POSE_CONNECTIONS;

        // 거리 알림 텍스트 표시
        if (distanceMessage) {
          ctx.save();
          ctx.font = "bold 24px Arial";
          ctx.fillStyle = distanceColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(distanceMessage, centerX, 20);
          ctx.restore();
        }

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
            console.log("가이드라인 안에 있음:", allInside);
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
