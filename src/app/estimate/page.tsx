"use client";

import { useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

export default function EstimatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    };
    startCamera();
  }, []);

  useEffect(() => {
    const runMoveNet = async () => {
      await tf.setBackend("webgl");
      await tf.ready();

      // ✅ MoveNet만 사용 (Mediapipe 옵션 제거)
      detectorRef.current = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        {
          modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );

      const detect = async () => {
        if (detectorRef.current && videoRef.current && canvasRef.current) {
          const poses = await detectorRef.current.estimatePoses(videoRef.current);

          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, 640, 480);
            ctx.drawImage(videoRef.current, 0, 0, 640, 480);

            poses.forEach((pose) => {
              pose.keypoints.forEach((kp) => {
                if (kp && kp.score != null && kp.score > 0.4) {
                  ctx.beginPath();
                  ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                  ctx.fillStyle = "red";
                  ctx.fill();
                }
              });

              // 👉 서버 전송
              fetch("http://<EC2-IP>:8000/api/landmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ landmarks: pose.keypoints }),
              }).catch(console.error);
            });
          }
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    runMoveNet();
  }, []);

  return (
    <div>
      <video ref={videoRef} width="640" height="480" style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
}
