export default function isTurtleNeck(
  earLeft: { x: number; y: number; z: number },
  earRight: { x: number; y: number; z: number },
  shoulderLeft: { x: number; y: number; z: number },
  shoulderRight: { x: number; y: number; z: number }
) {
  // ----- 1️⃣ 귀 중앙 M -----
  const M = {
    x: (earLeft.x + earRight.x) / 2,
    y: (earLeft.y + earRight.y) / 2,
    z: (earLeft.z + earRight.z) / 2,
  };

  // ----- 2️⃣ 어깨선 S (L→R) -----
  const S = {
    x: shoulderRight.x - shoulderLeft.x,
    y: shoulderRight.y - shoulderLeft.y,
    z: shoulderRight.z - shoulderLeft.z,
  };

  // 어깨 시작점
  const S0 = { ...shoulderLeft };

  // ----- 3️⃣ M을 S에 직교 투영 → M' -----
  // 투영 공식: M' = S0 + ((M-S0)·S / |S|²) * S
  const MS0 = {
    x: M.x - S0.x,
    y: M.y - S0.y,
    z: M.z - S0.z,
  };
  const dot_MS0_S = MS0.x * S.x + MS0.y * S.y + MS0.z * S.z;
  const S_len2 = S.x ** 2 + S.y ** 2 + S.z ** 2;

  const Mprime = {
    x: S0.x + (dot_MS0_S / S_len2) * S.x,
    y: S0.y + (dot_MS0_S / S_len2) * S.y,
    z: S0.z + (dot_MS0_S / S_len2) * S.z,
  };

  // ----- 4️⃣ 임의점 V (정면 방향 기준 보조점) -----
  // M'과 y는 같고, x=0, z=1로 단순 설정
  const V = { x: 0, y: Mprime.y, z: 1 };

  // ----- 5️⃣ 평면 P (S, V 포함) -----
  // 법선벡터 n = S × (V - M')
  const VminusM = {
    x: V.x - Mprime.x,
    y: V.y - Mprime.y,
    z: V.z - Mprime.z,
  };

  const n = {
    x: S.y * VminusM.z - S.z * VminusM.y,
    y: S.z * VminusM.x - S.x * VminusM.z,
    z: S.x * VminusM.y - S.y * VminusM.x,
  };

  // ----- 6️⃣ 벡터 MM' -----
  const MMp = {
    x: Mprime.x - M.x,
    y: Mprime.y - M.y,
    z: Mprime.z - M.z,
  };

  // ----- 7️⃣ MM'과 평면 P 사이 각도 -----
  // θ = 90° - arccos(|MM'·n| / (|MM'||n|))
  const dot = MMp.x * n.x + MMp.y * n.y + MMp.z * n.z;
  const lenMMp = Math.sqrt(MMp.x ** 2 + MMp.y ** 2 + MMp.z ** 2);
  const lenn = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);

  const angleRad = Math.PI / 2 - Math.acos(Math.abs(dot) / (lenMMp * lenn));
  const angleDeg = angleRad * (180 / Math.PI);

  // ----- 8️⃣ 임계값 판단 -----
  const isTurtle = angleDeg <= 51;

  console.log("📏 각도:", angleDeg.toFixed(2), "° →", isTurtle ? "거북목 ⚠️" : "정상 ✅");

  return isTurtle;
}