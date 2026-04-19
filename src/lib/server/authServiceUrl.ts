/**
 * Next Route Handler에서 auth-service(Nest)로 연결할 때 사용합니다.
 * 브라우저에 노출하지 마세요 — `.env.local`의 AUTH_SERVICE_URL 등.
 */
export function getAuthServiceUrl(): string {
  const raw = process.env.AUTH_SERVICE_URL ?? process.env.AUTH_INTERNAL_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:3002";
}
