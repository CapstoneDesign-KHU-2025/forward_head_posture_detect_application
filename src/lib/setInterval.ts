import { int } from "three/tsl";
import { saveSample } from "./postureLocal";
import isTurtleNeck, { isTurtleNeckProp } from "@/utils/isTurtleNeck";

let intervalId: any = null;

function startStoring(userId: string, turtleNeckProp: isTurtleNeckProp) {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    const angle = isTurtleNeck(turtleNeckProp).angleDeg;
    const isTurtle = isTurtleNeck(turtleNeckProp).isTurtle;

    await saveSample({
      userId,
      ts: Date.now(),
      angleDeg: angle,
      isTurtle,
      hasPose: true,
      sampleGapS: 1,
    });
  }, 10000);
}

function stopStoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
