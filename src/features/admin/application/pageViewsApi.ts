import { apiFetch, getApiBaseUrl, parseErrorMessage } from "@/lib/api/client";

export type AdminPageView = {
  id: string;
  userId: string;
  user: {
    email: string;
  };
  path: string;
  ipAddress: string;
  userAgent: string | null;
  occurredAt: string;
};

export type AdminPageViewsPage = {
  items: AdminPageView[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchAdminPageViews(page: number): Promise<AdminPageViewsPage> {
  const res = await apiFetch(
    `${getApiBaseUrl()}/admin/page-views?page=${encodeURIComponent(String(page))}`,
  );
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<AdminPageViewsPage>;
}
