import { describe, expect, it } from "vitest";

import { toDateKey, toYearMonthKey } from "@/features/calendar/domain/dateKey";

describe("toDateKey", () => {
  it("formats local calendar date as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 3, 9))).toBe("2026-04-09");
  });
});

describe("toYearMonthKey", () => {
  it("formats local calendar month as YYYY-MM", () => {
    expect(toYearMonthKey(new Date(2026, 3, 9))).toBe("2026-04");
  });
});
