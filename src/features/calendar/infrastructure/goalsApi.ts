function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "message" in body) {
      const msg = (body as { message: unknown }).message;
      if (Array.isArray(msg)) return msg.map(String).join(", ");
      if (typeof msg === "string") return msg;
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

export type MonthlyGoalDto = { yearMonth: string; body: string };
export type WeeklyGoalRowDto = { rangeKey: string; body: string };

export async function fetchMonthlyGoal(yearMonth: string): Promise<MonthlyGoalDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/monthly-goals/${encodeURIComponent(yearMonth)}`,
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<MonthlyGoalDto>;
}

export async function upsertMonthlyGoalRemote(
  yearMonth: string,
  body: string,
): Promise<MonthlyGoalDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/monthly-goals/${encodeURIComponent(yearMonth)}`,
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
  const res = await fetch(
    `${getApiBaseUrl()}/api/monthly-goals/${encodeURIComponent(yearMonth)}`,
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
  const res = await fetch(
    `${getApiBaseUrl()}/api/weekly-goals/batch?keys=${keysParam}`,
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<WeeklyGoalRowDto[]>;
}

export async function upsertWeeklyGoalRemote(
  rangeKey: string,
  body: string,
): Promise<WeeklyGoalRowDto> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/weekly-goals/${encodeURIComponent(rangeKey)}`,
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
  const res = await fetch(
    `${getApiBaseUrl()}/api/weekly-goals/${encodeURIComponent(rangeKey)}`,
    { method: "DELETE" },
  );
  if (res.status === 204 || res.status === 404) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}
