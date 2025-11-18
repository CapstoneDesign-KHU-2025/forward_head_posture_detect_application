export function computeImprovementPercent(weeklyAvg: number | null, todayAvg: number | null) {
  if (
    weeklyAvg == null ||
    todayAvg == null ||
    weeklyAvg <= 0 // 0으로 나누기 방지
  ) {
    return null; // 계산 불가 → UI에서 "-" 처리
  }

  const diff = weeklyAvg - todayAvg; // +면 개선, -면 악화
  const rate = (diff / weeklyAvg) * 100; // % 단위

  return rate; // 예: 12.3, -5.7 이런 값
}
