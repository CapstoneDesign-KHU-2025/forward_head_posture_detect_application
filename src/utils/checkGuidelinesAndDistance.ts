type PosePoint = { x: number; y: number; z: number };
type Pose = PosePoint[];

interface GuidelineCheckResult {
  faceInside: boolean;
  shoulderInside: boolean;
  isDistanceOk: boolean;
  distanceRatio: number;
  allInside: boolean;
}

function checkGuidelinesAndDistance(
  poses: Pose[],
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  offsetY: number
): GuidelineCheckResult {
  let faceInside = true;
  let shoulderInside = true;
  let isDistanceOk = true;
  let distanceRatio = 1;

  const tooCloseThreshold = 1.05;
  const tooFarThreshold = 0.7;

  if (poses.length > 0) {
    const pose: any = poses[0];

    const isInsideFaceGuideline = (x: number, y: number) => {
      const pixelX = x * canvas.width;
      const pixelY = y * canvas.height;

      const faceCenterX = centerX;
      const faceCenterY = centerY - 80 + offsetY;
      const radiusX = 90;
      const radiusY = 110;

      const dx = (pixelX - faceCenterX) / radiusX;
      const dy = (pixelY - faceCenterY) / radiusY;
      return dx * dx + dy * dy <= 1;
    };

    const isInsideUpperBodyGuideline = (x: number, y: number) => {
      const pixelX = x * canvas.width;
      const pixelY = y * canvas.height;

      const leftBound = centerX - 225;
      const rightBound = centerX + 225;
      const topBound = centerY + 60 + offsetY;
      const bottomBound = centerY + 280 + offsetY;

      return pixelX >= leftBound && pixelX <= rightBound && pixelY >= topBound && pixelY <= bottomBound;
    };

    const faceLandmarks = pose.slice(0, 11);
    if (faceLandmarks.length > 0) {
      faceInside = faceLandmarks.every((lm: any) => isInsideFaceGuideline(lm.x, lm.y));
    }

    const shoulderLandmarks = pose.slice(11, 13);
    if (shoulderLandmarks.length > 0) {
      shoulderInside = shoulderLandmarks.every((lm: any) => isInsideUpperBodyGuideline(lm.x, lm.y));
    }

    const lm11 = pose[11];
    const lm12 = pose[12];

    if (lm11 && lm12) {
      const shoulderWidth = Math.sqrt(
        Math.pow((lm12.x - lm11.x) * canvas.width, 2) + Math.pow((lm12.y - lm11.y) * canvas.height, 2)
      );

      const referenceShoulderWidth = 380;
      distanceRatio = shoulderWidth / referenceShoulderWidth;

      isDistanceOk = distanceRatio >= tooFarThreshold && distanceRatio <= tooCloseThreshold;
    }
  }

  const allInside = faceInside && shoulderInside && isDistanceOk;

  return {
    faceInside,
    shoulderInside,
    isDistanceOk,
    distanceRatio,
    allInside,
  };
}
