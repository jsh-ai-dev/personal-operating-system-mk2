import { apiFetch, getApiBaseUrl, parseErrorMessage } from "@/lib/api/client";

export type CalendarMemoDto = {
  id: string;
  dateKey: string;
  brief: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMemosInRange(from: string, to: string): Promise<CalendarMemoDto[]> {
  const url = `${getApiBaseUrl()}/memos?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<CalendarMemoDto[]>;
}

export async function upsertMemoRemote(body: {
  dateKey: string;
  brief: string;
  detail: string;
}): Promise<CalendarMemoDto> {
  const res = await apiFetch(`${getApiBaseUrl()}/memos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<CalendarMemoDto>;
}

export async function deleteMemoRemote(dateKey: string): Promise<void> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/memos/${encodeURIComponent(dateKey)}`,
    {
      method: "DELETE",
    },
  );
  if (res.status === 204 || res.status === 404) return;
  if (!res.ok) throw new Error(await parseErrorMessage(res));
}
