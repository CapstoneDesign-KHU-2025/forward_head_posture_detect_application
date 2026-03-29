import isTurtleNeck from "@/utils/isTurtleNeck";

describe("isTurtleNeck test", () => {
  const perfectPosture = {
    shoulderLeft: { x: 0, y: 0, z: 0 },
    shoulderRight: { x: 2, y: 0, z: 0 },
    earLeft: { x: 0, y: 1, z: 0 },
    earRight: { x: 2, y: 1, z: 0 },
  };

  const severeTurtleNeck = {
    shoulderLeft: { x: 0, y: 0, z: 0 },
    shoulderRight: { x: 2, y: 0, z: 0 },
    earLeft: { x: 0, y: 1, z: 1 },
    earRight: { x: 2, y: 1, z: 1 },
  };

  const borderlinePosture = {
    shoulderLeft: { x: 0, y: 0, z: 0 },
    shoulderRight: { x: 2, y: 0, z: 0 },
    earLeft: { x: 0, y: 1, z: 0.9325 },
    earRight: { x: 2, y: 1, z: 0.9325 },
  };

  const highBorderlinePosture = {
    shoulderLeft: { x: 0, y: 0, z: 0 },
    shoulderRight: { x: 2, y: 0, z: 0 },
    earLeft: { x: 0, y: 1, z: 0.8693 },
    earRight: { x: 2, y: 1, z: 0.8693 },
  };

  it("good posture => false", () => {
    const result = isTurtleNeck(perfectPosture);
    expect(result.angleDeg).toBeCloseTo(90, 1);
    expect(result.isTurtle).toBe(false);
  });

  it("bad posture => true", () => {
    const result = isTurtleNeck(severeTurtleNeck);
    expect(result.angleDeg).toBeCloseTo(45, 1);
    expect(result.isTurtle).toBe(true);
  });

  describe("Sensitivity Threshold", () => {
    it("low sensitivity (below 45): 47 => false", () => {
      const result = isTurtleNeck({ ...borderlinePosture, sensitivity: "low" });
      expect(Math.round(result.angleDeg)).toBe(47);
      expect(result.isTurtle).toBe(false);
    });

    it("normal sensitivity (below 48): 47 => true", () => {
      const result = isTurtleNeck({ ...borderlinePosture, sensitivity: "normal" });
      expect(Math.round(result.angleDeg)).toBe(47);
      expect(result.isTurtle).toBe(true);
    });

    it("high sensitivity (below 50): 49 => true", () => {
      const result = isTurtleNeck({ ...highBorderlinePosture, sensitivity: "high" });
      expect(Math.round(result.angleDeg)).toBe(49);
      expect(result.isTurtle).toBe(true);
    });
  });
});
