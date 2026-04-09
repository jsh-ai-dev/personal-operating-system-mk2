export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

/** 날짜별 메모: brief는 달력 셀에 짧게, detail은 오른쪽 패널에 상세 기록 */
export type DayMemo = {
  brief: string;
  detail: string;
};

