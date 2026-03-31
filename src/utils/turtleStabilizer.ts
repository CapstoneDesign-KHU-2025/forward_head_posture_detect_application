import type { Sensitivity } from "./types";

// average every 1 sec + threshold
let angleBuffer: number[] = [];
let lastUpdate = Date.now();
let lastState = false;

export default function turtleStabilizer(angleDeg: number, sensitivity: Sensitivity = "normal") {
  const INTERVAL_MS = 1000;

  let ENTER_THRESHOLD: number;
  let EXIT_THRESHOLD: number;

  switch (sensitivity) {
    case "low":
      ENTER_THRESHOLD = 45;
      EXIT_THRESHOLD = 51;
      break;
    case "high":
      ENTER_THRESHOLD = 50;
      EXIT_THRESHOLD = 51;
      break;
    case "normal":
    default:
      ENTER_THRESHOLD = 48;
      EXIT_THRESHOLD = 51;
      break;
  }

  const now = Date.now();
  angleBuffer.push(angleDeg);

  if (now - lastUpdate < INTERVAL_MS) {
    return null;
  }

  //more than 1 sec -> calculate average
  const avgAngle = angleBuffer.reduce((sum, v) => sum + v, 0) / angleBuffer.length;
  angleBuffer = [];
  lastUpdate = now;

  if (!lastState && avgAngle <= ENTER_THRESHOLD) {
    lastState = true; // into fhp
  } else if (lastState && avgAngle >= EXIT_THRESHOLD) {
    lastState = false; // into normal
  }

  return { avgAngle, isTurtle: lastState };
}
