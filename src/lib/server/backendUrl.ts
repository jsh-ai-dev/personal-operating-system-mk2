/**
 * Next 서버(Route Handler)에서만 Nest로 연결할 때 사용합니다.
 * 브라우저에 노출하지 마세요 — `.env.local`의 BACKEND_URL 등.
 */
export function getBackendUrl(): string {
  const raw = process.env.BACKEND_URL ?? process.env.API_INTERNAL_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:3001";
}
