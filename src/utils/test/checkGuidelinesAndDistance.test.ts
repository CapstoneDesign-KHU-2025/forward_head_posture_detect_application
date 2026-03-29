import { checkGuidelinesAndDistance, Pose } from "@/utils/checkGuidelinesAndDistance";

describe("checkGuidelinesAndDistance 테스트", () => {
  const mockCanvas = { width: 640, height: 480 } as HTMLCanvasElement;
  const centerX = 320;
  const centerY = 240;
  const offsetY = 0;

  const createPerfectPose = (): Pose => {
    const pose = Array(13).fill({ x: 0, y: 0, z: 0 });
    for (let i = 0; i <= 10; i++) {
      pose[i] = { x: 0.5, y: 0.333, z: 0 };
    }
    pose[11] = { x: 0.2, y: 0.8, z: 0 };
    pose[12] = { x: 0.8, y: 0.8, z: 0 };

    return pose;
  };

  it("empty pose => all false", () => {
    const result = checkGuidelinesAndDistance([], mockCanvas, centerX, centerY, offsetY);
    expect(result.allInside).toBe(false);
    expect(result.faceInside).toBe(false);
    expect(result.shoulderInside).toBe(false);
  });

  it("in guideline => all true", () => {
    const result = checkGuidelinesAndDistance([createPerfectPose()], mockCanvas, centerX, centerY, offsetY);
    expect(result.faceInside).toBe(true);
    expect(result.shoulderInside).toBe(true);
    expect(result.isDistanceOk).toBe(true);
    expect(result.allInside).toBe(true);
  });

  it("outside of Face Guideline => faceInside => false", () => {
    const pose = createPerfectPose();
    pose[0] = { x: 0.656, y: 0.333, z: 0 };

    const result = checkGuidelinesAndDistance([pose], mockCanvas, centerX, centerY, offsetY);
    expect(result.faceInside).toBe(false);
    expect(result.allInside).toBe(false);
  });

  it("too far(too narrow shoulders points) => isDistanceOk => false", () => {
    const pose = createPerfectPose();
    pose[11] = { x: 0.343, y: 0.8, z: 0 };
    pose[12] = { x: 0.656, y: 0.8, z: 0 };

    const result = checkGuidelinesAndDistance([pose], mockCanvas, centerX, centerY, offsetY);
    expect(result.isDistanceOk).toBe(false);
    expect(result.distanceRatio).toBeLessThan(0.7);
  });

  it("too close(too wide shoulders points) isDistanceOk => false", () => {
    const pose = createPerfectPose();
    pose[11] = { x: 0.148, y: 0.8, z: 0 };
    pose[12] = { x: 0.851, y: 0.8, z: 0 };

    const result = checkGuidelinesAndDistance([pose], mockCanvas, centerX, centerY, offsetY);
    expect(result.isDistanceOk).toBe(false);
    expect(result.distanceRatio).toBeGreaterThan(1.05);
  });
});
