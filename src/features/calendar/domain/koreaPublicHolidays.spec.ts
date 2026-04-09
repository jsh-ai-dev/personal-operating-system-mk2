import { describe, expect, it } from "vitest";

import { getKoreaPublicHolidayName } from "@/features/calendar/domain/koreaPublicHolidays";

describe("getKoreaPublicHolidayName", () => {
  it("returns Korean name for New Year's Day from library", () => {
    expect(getKoreaPublicHolidayName(new Date(2026, 0, 1))).toBe("신정");
  });

  it("returns substitute holiday from supplement when library omits it", () => {
    expect(getKoreaPublicHolidayName(new Date(2026, 4, 25))).toBe("부처님오신날 대체공휴일");
  });

  it("returns Children's Day substitute from supplement", () => {
    expect(getKoreaPublicHolidayName(new Date(2024, 4, 6))).toBe("어린이날 대체공휴일");
  });

  it("returns Labor Day on May 1 (not in date-holidays KR)", () => {
    expect(getKoreaPublicHolidayName(new Date(2026, 4, 1))).toBe("근로자의 날");
  });
});
