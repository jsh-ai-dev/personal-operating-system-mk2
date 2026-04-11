import { parseErrorMessage } from "@/lib/api/parseErrorMessage";

/**
 * 브라우저 → 동일 출처 Next BFF(`/api/backend/...`)만 호출합니다.
 * JWT는 httpOnly 쿠키로만 전달되며, 이 함수는 `credentials: 'include'`로 쿠키를 붙입니다.
 */
export function getApiBaseUrl(): string {
  return "/api/backend";
}

export { parseErrorMessage };

export async function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.assign("/login");
  }

  return res;
}
