"use client";

import { useEffect, useRef } from "react";
import { FilesetResolver, PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import isTurtleNeck from "@/utils/isTurtleNeck";

export default function PoseLocalOnly() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);

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

      const loop = () => {
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
        }
        
        // 둘 다 통과해야 초록색, 하나라도 실패하면 빨간색
        const allInside = faceInside && shoulderInside;
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

        for (const pose of poses) {
          // 랜드마크 그리기
          const utils = new DrawingUtils(ctx);
          utils.drawConnectors(pose as any, conns, { lineWidth: 2 });
          utils.drawLandmarks(pose as any, { radius: 3 });

          // 7, 8, 11, 12번 랜드마크 좌표 출력
          const now = Date.now();
          if (now - lastLogTimeRef.current >= 60 * 100) {
            const lm7 = pose[7];
            const lm8 = pose[8];
            const lm11 = pose[11];
            const lm12 = pose[12];
            console.log("Landmark 7:", lm7);
            console.log("Landmark 8:", lm8);
            console.log("Landmark 11:", lm11);
            console.log("Landmark 12:", lm12);
            console.log("가이드라인 안에 있음:", allInside);
            lastLogTimeRef.current = now;
            const isturtle = isTurtleNeck(
              { x: lm7["x"], y: lm7["y"], z: lm7["z"] },
              { x: lm8["x"], y: lm8["y"], z: lm8["z"] },
              { x: lm11["x"], y: lm11["y"], z: lm11["z"] },
              { x: lm12["x"], y: lm12["y"], z: lm12["z"] }
            );
            console.log("거북목?", isturtle);
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
    <div>
      <video ref={videoRef} style={{ position: "absolute", left: -9999 }} />
      <canvas ref={canvasRef} />
    </div>
  );
}
