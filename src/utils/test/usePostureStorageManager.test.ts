import { renderHook } from "@testing-library/react";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { finalizeUpToNow } from "@/lib/hourlyOps";

jest.mock("@/lib/postureLocal", () => ({
  storeMeasurementAndAccumulate: jest.fn(),
}));

jest.mock("@/lib/hourlyOps", () => ({
  finalizeUpToNow: jest.fn(),
}));

describe("usePostureStorageManager Hook test", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("when the app starts(mount) run finalizeUpToNow one time, run it again in an hour", () => {
    renderHook(() => usePostureStorageManager("user123", 40, false, "sess-1", true));

    expect(finalizeUpToNow).toHaveBeenCalledTimes(1);
    expect(finalizeUpToNow).toHaveBeenCalledWith("user123", true);

    jest.advanceTimersByTime(60 * 60 * 1000);

    expect(finalizeUpToNow).toHaveBeenCalledTimes(2);
  });

  it("if measuring is true, every 10 secs, store newest angle", () => {
    const { rerender } = renderHook(
      ({ angle, isTurtle }) => usePostureStorageManager("user123", angle, isTurtle, "sess-1", true),
      {
        initialProps: { angle: 40, isTurtle: false },
      },
    );

    jest.advanceTimersByTime(10000);

    expect(storeMeasurementAndAccumulate).toHaveBeenCalledTimes(1);
    expect(storeMeasurementAndAccumulate).toHaveBeenCalledWith(
      expect.objectContaining({
        angleDeg: 40,
        isTurtle: false,
        sampleGapS: 10,
      }),
    );

    rerender({ angle: 55, isTurtle: true });

    jest.advanceTimersByTime(10000);

    expect(storeMeasurementAndAccumulate).toHaveBeenCalledTimes(2);
    expect(storeMeasurementAndAccumulate).toHaveBeenCalledWith(
      expect.objectContaining({
        angleDeg: 55,
        isTurtle: true,
      }),
    );
  });

  it("measuring === false => don't store", () => {
    renderHook(() => usePostureStorageManager("user123", 40, false, "sess-1", false));
    jest.advanceTimersByTime(10000);

    expect(storeMeasurementAndAccumulate).not.toHaveBeenCalled();
  });

  it("without userId, sessionId => timer doesn't work", () => {
    renderHook(() => usePostureStorageManager(undefined, 40, false, undefined, true));

    expect(finalizeUpToNow).not.toHaveBeenCalled();

    jest.advanceTimersByTime(10000);
    expect(storeMeasurementAndAccumulate).not.toHaveBeenCalled();
  });
});
