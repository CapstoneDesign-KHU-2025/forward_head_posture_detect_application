import { formatMeasuredTime } from "@/app/[locale]/components/home.utils";

describe("utils/formatMeasuredTime test", () => {
  it("null/undefined => 0m", () => {
    expect(formatMeasuredTime(null as any)).toBe("0m");
  });

  it("below 0 => 0m", () => {
    expect(formatMeasuredTime(0)).toBe("0m");
    expect(formatMeasuredTime(-100)).toBe("0m");
  });

  it("below 1h => (nn)m", () => {
    expect(formatMeasuredTime(59)).toBe("0m");
    expect(formatMeasuredTime(60)).toBe("1m");
    expect(formatMeasuredTime(3599)).toBe("59m");
  });

  it("above 1h => (nn)h (nn)m", () => {
    expect(formatMeasuredTime(3600)).toBe("1h0m");
    expect(formatMeasuredTime(3660)).toBe("1h1m");
    expect(formatMeasuredTime(7320)).toBe("2h2m");
  });
});
