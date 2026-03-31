import { isTurtleNeckProp } from "./types";

export default function isTurtleNeck({
  earLeft,
  earRight,
  shoulderLeft,
  shoulderRight,
  sensitivity = "normal",
}: isTurtleNeckProp) {
  // center of ears
  const M = {
    x: (earLeft.x + earRight.x) / 2,
    y: (earLeft.y + earRight.y) / 2,
    z: (earLeft.z + earRight.z) / 2,
  };

  // shoulder line
  const S = {
    x: shoulderRight.x - shoulderLeft.x,
    y: shoulderRight.y - shoulderLeft.y,
    z: shoulderRight.z - shoulderLeft.z,
  };

  // shoulder starting point
  const S0 = { ...shoulderLeft };

  // Orthogonal projection of M onto S -> M'
  // projection formula: M' = S0 + ((M-S0)·S / |S|²) * S
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

  // arbitrary point V : reference point relative to the forward direction
  // M' and y are the same . x is simply set to M. x and z to 1
  const V = { x: M.x, y: Mprime.y, z: 1 };

  // plane P (containing S and V)
  // Normal vector n = S x(V-M')
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

  // vector MM'
  const MMp = {
    x: Mprime.x - M.x,
    y: Mprime.y - M.y,
    z: Mprime.z - M.z,
  };

  // angle between MM' and plane P
  // θ = 90° - arccos(|MM'·n| / (|MM'||n|))
  const dot = MMp.x * n.x + MMp.y * n.y + MMp.z * n.z;
  const lenMMp = Math.sqrt(MMp.x ** 2 + MMp.y ** 2 + MMp.z ** 2);
  const lenn = Math.sqrt(n.x ** 2 + n.y ** 2 + n.z ** 2);

  const angleRad = Math.PI / 2 - Math.acos(Math.abs(dot) / (lenMMp * lenn));
  const angleDeg = angleRad * (180 / Math.PI);

  // setting thresholds based on sensitivity
  let threshold: number;
  switch (sensitivity) {
    case "low":
      threshold = 45;
      break;
    case "high":
      threshold = 50;
      break;
    case "normal":
    default:
      threshold = 48;
      break;
  }

  const isTurtle = angleDeg <= threshold;

  return { angleDeg, isTurtle };
}
