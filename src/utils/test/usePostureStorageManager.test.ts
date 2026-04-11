import { renderHook, act } from "@testing-library/react";
import { usePostureStorageManager } from "@/hooks/usePostureStorageManager";
import { storeMeasurementAndAccumulate } from "@/lib/postureLocal";
import { finalizeUpToNow } from "@/lib/hourlyOps";

jest.mock("@/lib/postureLocal", () => ({
  storeMeasurementAndAccumulate: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/hourlyOps", () => ({
  finalizeUpToNow: jest.fn().mockResolvedValue(undefined),
}));

describe("usePostureStorageManager Hook test", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const flushPromises = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  it("when the app starts(mount) run finalizeUpToNow one time, run it again in an hour", async () => {
    renderHook(() =>
      usePostureStorageManager("user123", 40, false, "sess-1", true),
    );

    expect(finalizeUpToNow).toHaveBeenCalledTimes(1);
    expect(finalizeUpToNow).toHaveBeenCalledWith("user123", true);
    await flushPromises();
    await act(async () => {
      jest.advanceTimersByTime(60 * 60 * 1000);
    });
    await flushPromises();

    expect(finalizeUpToNow).toHaveBeenCalledTimes(2);
  });

  it("if measuring is true, every 10 secs, store newest angle", async () => {
    const { rerender } = renderHook(
      ({ angle, isTurtle }) =>
        usePostureStorageManager("user123", angle, isTurtle, "sess-1", true),
      {
        initialProps: { angle: 40, isTurtle: false },
      },
    );

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await flushPromises();

    expect(storeMeasurementAndAccumulate).toHaveBeenCalledTimes(1);
    expect(storeMeasurementAndAccumulate).toHaveBeenCalledWith(
      expect.objectContaining({
        angleDeg: 40,
        isTurtle: false,
        sampleGapS: 10,
      }),
    );

    rerender({ angle: 55, isTurtle: true });

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await flushPromises();

    expect(storeMeasurementAndAccumulate).toHaveBeenCalledTimes(2);
    expect(storeMeasurementAndAccumulate).toHaveBeenCalledWith(
      expect.objectContaining({
        angleDeg: 55,
        isTurtle: true,
      }),
    );
  });

  it("measuring === false => don't store", async () => {
    renderHook(() =>
      usePostureStorageManager("user123", 40, false, "sess-1", false),
    );

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await flushPromises();

    expect(storeMeasurementAndAccumulate).not.toHaveBeenCalled();
  });

  it("without userId, sessionId => timer doesn't work", async () => {
    renderHook(() =>
      usePostureStorageManager(undefined, 40, false, undefined, true),
    );

    expect(finalizeUpToNow).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    await flushPromises();

    expect(storeMeasurementAndAccumulate).not.toHaveBeenCalled();
  });
});
