import type { Sensitivity } from "./sensitivity";

// 거북목 판정 안정화 모듈 (1초 평균 + 임계값 도입)
let angleBuffer: number[] = [];
let lastUpdate = Date.now();
let lastState = false; // false = 정상, true = 거북목

export default function turtleStabilizer(angleDeg: number, sensitivity: Sensitivity = "normal") {
  const INTERVAL_MS = 1000;       // 1초마다 판정
  
  // 민감도에 따른 임계값 설정
  let ENTER_THRESHOLD: number;
  let EXIT_THRESHOLD: number;
  
  switch (sensitivity) {
    case "low":
      ENTER_THRESHOLD = 45;  // 낮음 (45도 이하에서 거북목 진입)
      EXIT_THRESHOLD = 48;   // 낮음 (48도 이상에서 정상 복귀)
      break;
    case "high":
      ENTER_THRESHOLD = 50;  // 높음 (50도 이하에서 거북목 진입)
      EXIT_THRESHOLD = 53;   // 높음 (53도 이상에서 정상 복귀)
      break;
    case "normal":
    default:
      ENTER_THRESHOLD = 48;  // 보통 (48도 이하에서 거북목 진입)
      EXIT_THRESHOLD = 51;   // 보통 (51도 이상에서 정상 복귀)
      break;
  }

  const now = Date.now();
  angleBuffer.push(angleDeg);

  // 아직 1초 안 지났으면 대기
  if (now - lastUpdate < INTERVAL_MS) {
    return null;
  }

  // 1초 경과 시 평균 계산
  const avgAngle = angleBuffer.reduce((sum, v) => sum + v, 0) / angleBuffer.length;
  angleBuffer = [];
  lastUpdate = now;

  // 임계값 적용
  if (!lastState && avgAngle <= ENTER_THRESHOLD) {
    lastState = true; // 거북목 진입
  } else if (lastState && avgAngle >= EXIT_THRESHOLD) {
    lastState = false; // 정상 복귀
  }

  return { avgAngle, isTurtle: lastState };
}