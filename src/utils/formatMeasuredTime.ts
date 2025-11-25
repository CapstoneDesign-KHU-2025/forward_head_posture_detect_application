export function formatMeasuredTime(totalSeconds: number): string {
  if (totalSeconds == null) return "0초";

  // 혹시 소수 들어와도 방지
  const sec = Math.floor(totalSeconds);

  if (sec <= 0) return "0초";

  // 1분 미만이면 초로 보여주기
  if (sec < 60) {
    return `${sec}초`;
  }

  const totalMinutes = Math.floor(sec / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}분`;
  }

  return `${hours}시간 ${minutes}분`;
}
