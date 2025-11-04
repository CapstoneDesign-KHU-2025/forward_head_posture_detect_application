// 거북목 판정 안정화 모듈 (1초 평균 + 임계값 도입)
let angleBuffer: number[] = [];
let lastUpdate = Date.now();
let lastState = false; // false = 정상, true = 거북목

export default function turtleStabilizer(angleDeg: number) {
  const INTERVAL_MS = 1000;       // 1초마다 판정
  const ENTER_THRESHOLD = 48;     // 진입 (거북목으로 전환)
  const EXIT_THRESHOLD = 51;      // 복귀 (정상으로 전환)

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