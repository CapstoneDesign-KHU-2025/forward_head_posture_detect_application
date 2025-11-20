import { storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import isTurtleNeck, { isTurtleNeckProp } from "@/utils/isTurtleNeck";

let intervalId: any = null;

export function startPostureTracking(userId: string, turtleNeckProp: isTurtleNeckProp) {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    const angle = isTurtleNeck(turtleNeckProp).angleDeg;
    const isTurtle = isTurtleNeck(turtleNeckProp).isTurtle;

    await storeMeasurementAndAccumulate({
      userId,
      ts: Date.now(),
      angleDeg: angle,
      isTurtle,
      hasPose: true,
      sampleGapS: 10,
    });
  }, 10_000);
}

export function stopStoring() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
