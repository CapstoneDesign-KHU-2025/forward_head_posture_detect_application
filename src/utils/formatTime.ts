export const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "오후" : "오전";
  const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${period} ${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
