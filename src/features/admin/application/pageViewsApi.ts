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

export type AdminPageViewFilterOption = {
  value: string;
  count: number;
};

export type AdminPageViewsPage = {
  items: AdminPageView[];
  filters: {
    ipAddresses: AdminPageViewFilterOption[];
    emails: AdminPageViewFilterOption[];
  };
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type FetchAdminPageViewsParams = {
  page: number;
  ipAddresses?: string[];
  emails?: string[];
};

export async function fetchAdminPageViews({
  page,
  ipAddresses,
  emails,
}: FetchAdminPageViewsParams): Promise<AdminPageViewsPage> {
  const search = new URLSearchParams({ page: String(page) });
  if (ipAddresses) search.set("ips", ipAddresses.join(","));
  if (emails) search.set("emails", emails.join(","));

  const res = await apiFetch(`${getApiBaseUrl()}/admin/page-views?${search.toString()}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<AdminPageViewsPage>;
}
