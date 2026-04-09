"use client";

import { useCallback, useMemo, useState } from "react";

import {
  addMonths,
  createMonthCalendar,
  getStartOfMonth,
  toMonthLabel,
} from "@/features/calendar/domain/calendar";
import { getCalendarWeekRanges } from "@/features/calendar/domain/calendarWeekRows";
import { buildKoreaPublicHolidayNameMap } from "@/features/calendar/domain/koreaPublicHolidays";
import { toDateKey, toYearMonthKey } from "@/features/calendar/domain/dateKey";
import type { DayMemo } from "@/features/calendar/domain/types";

const emptyMemo = (): DayMemo => ({ brief: "", detail: "" });

export function useCalendar() {
  const [viewDate, setViewDate] = useState<Date>(() => getStartOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [memos, setMemos] = useState<Record<string, DayMemo>>({});
  const [monthlyGoals, setMonthlyGoals] = useState<Record<string, string>>({});
  const [weeklyGoals, setWeeklyGoals] = useState<Record<string, string>>({});

  const days = useMemo(() => createMonthCalendar(viewDate), [viewDate]);
  const monthLabel = useMemo(() => toMonthLabel(viewDate), [viewDate]);
  const viewYearMonthKey = useMemo(() => toYearMonthKey(viewDate), [viewDate]);
  const weekRanges = useMemo(() => getCalendarWeekRanges(days), [days]);

  const publicHolidayNamesByDateKey = useMemo(
    () => buildKoreaPublicHolidayNameMap(days.map((d) => d.date)),
    [days],
  );

  const monthlyGoal = monthlyGoals[viewYearMonthKey] ?? "";

  const selectedMemo = useMemo(() => {
    if (!selectedDate) return emptyMemo();
    const key = toDateKey(selectedDate);
    return memos[key] ?? emptyMemo();
  }, [memos, selectedDate]);

  const getBriefForDate = useCallback(
    (date: Date) => {
      const key = toDateKey(date);
      return memos[key]?.brief?.trim() ?? "";
    },
    [memos],
  );

  const setBriefForSelected = useCallback(
    (brief: string) => {
      if (!selectedDate) return;
      const key = toDateKey(selectedDate);
      setMemos((prev) => {
        const cur = prev[key] ?? emptyMemo();
        return { ...prev, [key]: { ...cur, brief } };
      });
    },
    [selectedDate],
  );

  const setDetailForSelected = useCallback(
    (detail: string) => {
      if (!selectedDate) return;
      const key = toDateKey(selectedDate);
      setMemos((prev) => {
        const cur = prev[key] ?? emptyMemo();
        return { ...prev, [key]: { ...cur, detail } };
      });
    },
    [selectedDate],
  );

  const goToPreviousMonth = () => {
    setViewDate((current) => addMonths(current, -1));
  };

  const goToNextMonth = () => {
    setViewDate((current) => addMonths(current, 1));
  };

  const goToCurrentMonth = () => {
    setViewDate(getStartOfMonth(new Date()));
  };

  const setMonthlyGoal = useCallback((text: string) => {
    setMonthlyGoals((prev) => ({ ...prev, [viewYearMonthKey]: text }));
  }, [viewYearMonthKey]);

  const setWeeklyGoalForRange = useCallback((rangeKey: string, text: string) => {
    setWeeklyGoals((prev) => ({ ...prev, [rangeKey]: text }));
  }, []);

  return {
    days,
    monthLabel,
    viewYearMonthKey,
    weekRanges,
    publicHolidayNamesByDateKey,
    monthlyGoal,
    setMonthlyGoal,
    weeklyGoals,
    setWeeklyGoalForRange,
    selectedDate,
    setSelectedDate,
    selectedBrief: selectedMemo.brief,
    selectedDetail: selectedMemo.detail,
    setBriefForSelected,
    setDetailForSelected,
    getBriefForDate,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
