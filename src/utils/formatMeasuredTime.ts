/**
 * 총 측정 시간(초 단위)을 "X분" 또는 "X시간 Y분" 형태로 변환
 */
export function formatMeasuredTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0분";

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }

  return `${hours}시간 ${minutes}분`;
}
