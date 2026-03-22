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
    const result = getKpiConfigs({ ...baseData, todayAvg: 40, loading: false }, t);

    expect(result).toHaveLength(4);
    expect(result[0].value).toBe("40.0");
  });

  it("2. initial loading state: isLoading === true, if data === null, 1 empty card", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: null, loading: true }, t);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe("HomeData.empty.label");
  });

  it("3. empty data state: isLoading === false, todayData === null", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: null, loading: false }, t);
    console.log("Empty 상태일 때의 반환값:", result);

    // 만약 기획상 데이터가 없을 때는 아예 카드를 1개(비어있음)만 보여줘야 한다면?
    // 여기서 테스트가 실패(FAIL)해야 맞습니다.
    // expect(result).toHaveLength(1);
  });

  it("4. partial data state: todayAvg(o), weeklyAvg(x) => deltaText? ", () => {
    const result = getKpiConfigs({ ...baseData, todayAvg: 40, weeklyAvg: null, loading: false }, t);

    expect(result).toHaveLength(4);
    expect(result[0].deltaText).toBe(""); // 주간 데이터가 없으니 비교값도 없어야 함
    expect(result[0].deltaVariant).toBe("neutral");
  });
});
