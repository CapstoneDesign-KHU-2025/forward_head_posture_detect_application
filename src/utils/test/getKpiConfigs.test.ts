import { getKpiConfigs } from "@/utils/getKpiConfigs";

describe("getKpiConfigs edge case test", () => {
  const t = (key: string) => key;
  const baseData = {
    weeklyAvg: 45,
    todayCount: 10,
    todayHour: 2,
    improvementValue: 5.5,
    improvementText: "Good",
  };

  it("1. normal: data(o), after loading => 4 cards", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: 40, loading: false, isNewUser: false }, t);

    expect(result).toHaveLength(4);
    expect(result[0].value).toBe("40.0");
  });

  it("2. initial loading state: isLoading === true, if data === null, 1 empty card", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: null, loading: true, isNewUser: false }, t);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("loading");
  });

  it("3. empty data state but exist user: isLoading === false, todayData === null", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: null, loading: false, isNewUser: false }, t);
    expect(result).toHaveLength(4);
  });
  it("4. newUser: isNewUser === true", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: null, loading: false, isNewUser: true }, t);
    expect(result).toHaveLength(1);
  });
  it("5. partial data state: todayAvg(o), weeklyAvg(x) => deltaText? ", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: 40, weeklyAvg: null, loading: false, isNewUser: false }, t);

    expect(result).toHaveLength(4);
    expect(result[0].deltaText).toBe("");
    expect(result[0].deltaVariant).toBe("neutral");
  });
});
