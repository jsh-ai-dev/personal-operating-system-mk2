import Holidays from "date-holidays";

import supplements from "@/features/calendar/data/koreaHolidaySupplements.json";
import { toDateKey } from "@/features/calendar/domain/dateKey";

/**
 * 1차: `date-holidays` KR 규칙 (설·추석·「관공서의 공휴일」에 해당하는 날 등)
 * 2차: `koreaHolidaySupplements.json` — 대체공휴일·임시공휴일 등 라이브러리에 빠진 날짜 보강
 * 3차: 매년 5월 1일 **근로자의 날** — `date-holidays` KR에 없으나 벽걸이 달력·생활 달력에서 빨간 날로 쓰는 관례 반영
 *    (법적 휴무 범위는 업종·고용 형태에 따라 다를 수 있음)
 *
 * 완전한 정확성이 필요하면 행정안전부·우주항공청 월력요항 또는 공공데이터 API와 주기적으로 대조하는 것이 좋습니다.
 */
const krHolidays = new Holidays("KR", { languages: ["ko", "en"] });

const supplementByDateKey = supplements as Record<string, string>;

function getLibraryKoreaPublicHolidayName(date: Date): string | undefined {
  const atNoon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const list = krHolidays.isHoliday(atNoon);
  if (!list || list.length === 0) return undefined;
  const pub = list.find((h) => h.type === "public");
  return (pub ?? list[0]).name;
}

/** 양력 5월 1일 근로자의 날 (라이브러리 미포함, 달력 표기용) */
function getLaborDayDisplayName(date: Date): string | undefined {
  if (date.getMonth() === 4 && date.getDate() === 1) {
    return "근로자의 날";
  }
  return undefined;
}

/**
 * 라이브러리 + 보강 JSON + 근로자의 날(5/1)을 합친 표시용 이름.
 * 여러 출처가 겹치면 "이름1 · 이름2" 순으로 이어 붙입니다.
 */
export function getKoreaPublicHolidayName(date: Date): string | undefined {
  const key = toDateKey(date);
  const fromSupplement = supplementByDateKey[key];
  const fromLibrary = getLibraryKoreaPublicHolidayName(date);
  const laborDay = getLaborDayDisplayName(date);

  const ordered = [fromLibrary, fromSupplement, laborDay].filter(
    (segment): segment is string => Boolean(segment),
  );
  const unique: string[] = [];
  for (const segment of ordered) {
    if (!unique.includes(segment)) {
      unique.push(segment);
    }
  }

  if (unique.length === 0) return undefined;
  return unique.join(" · ");
}

/** 달력에 그려지는 날짜들만 스캔해 공휴일 이름 맵을 만듭니다. */
export function buildKoreaPublicHolidayNameMap(dates: Iterable<Date>): Map<string, string> {
  const map = new Map<string, string>();
  for (const date of dates) {
    const key = toDateKey(date);
    if (map.has(key)) continue;
    const name = getKoreaPublicHolidayName(date);
    if (name) map.set(key, name);
  }
  return map;
}
