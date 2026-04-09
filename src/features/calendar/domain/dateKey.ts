/**
 * 로컬 날짜 기준 키. 메모 저장/조회 시 타임존·시간대 혼선을 줄이기 위해 사용합니다.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 월간 목표 등 월 단위 상태 키 (로컬 달력 기준) */
export function toYearMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
