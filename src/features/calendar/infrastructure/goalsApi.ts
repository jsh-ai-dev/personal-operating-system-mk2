import { apiFetch, getApiBaseUrl, parseErrorMessage } from "@/lib/api/client";

export type MonthlyGoalDto = { yearMonth: string; body: string };
export type WeeklyGoalRowDto = { rangeKey: string; body: string };

export async function fetchMonthlyGoal(yearMonth: string): Promise<MonthlyGoalDto> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/monthly-goals/${encodeURIComponent(yearMonth)}`,
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<MonthlyGoalDto>;
}

export async function upsertMonthlyGoalRemote(
  yearMonth: string,
  body: string,
): Promise<MonthlyGoalDto> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/monthly-goals/${encodeURIComponent(yearMonth)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<MonthlyGoalDto>;
}

export async function deleteMonthlyGoalRemote(yearMonth: string): Promise<void> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/monthly-goals/${encodeURIComponent(yearMonth)}`,
    { method: "DELETE" },
  );
  if (res.status === 204 || res.status === 404) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}

export async function fetchWeeklyGoalsBatch(
  keys: string[],
): Promise<WeeklyGoalRowDto[]> {
  if (keys.length === 0) return [];
  const keysParam = keys.map((k) => encodeURIComponent(k)).join(",");
  const res = await apiFetch(
    `${getApiBaseUrl()}/weekly-goals/batch?keys=${keysParam}`,
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<WeeklyGoalRowDto[]>;
}

export async function upsertWeeklyGoalRemote(
  rangeKey: string,
  body: string,
): Promise<WeeklyGoalRowDto> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/weekly-goals/${encodeURIComponent(rangeKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<WeeklyGoalRowDto>;
}

export async function deleteWeeklyGoalRemote(rangeKey: string): Promise<void> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/weekly-goals/${encodeURIComponent(rangeKey)}`,
    { method: "DELETE" },
  );
  if (res.status === 204 || res.status === 404) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}
