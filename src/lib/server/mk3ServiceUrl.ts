/**
 * Next Route Handler -> mk3(FastAPI)로 프록시할 때 사용합니다.
 * 브라우저에 노출하지 마세요 — `.env.local`의 MK3_SERVICE_URL 등.
 */
export function getMk3ServiceUrl(): string {
  const raw = process.env.MK3_SERVICE_URL ?? process.env.MK3_API_INTERNAL_URL;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8001";
}
