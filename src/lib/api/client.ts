import { parseErrorMessage } from "@/lib/api/parseErrorMessage";

/**
 * 브라우저 → 동일 출처 Next BFF(`/api/backend/...`)만 호출합니다.
 * JWT는 httpOnly 쿠키로만 전달되며, 이 함수는 `credentials: 'include'`로 쿠키를 붙입니다.
 */
export function getApiBaseUrl(): string {
  return "/api/backend";
}

export { parseErrorMessage };

/**
 * 401이 나와도 여기서 로그아웃하지 않습니다.
 * Nest·Spring·환경 불일치(JWT 비밀 불일치, mk1 미기동 등)에서도 401이 날 수 있어,
 * 자동 로그아웃은 “세션 만료”로 오인하기 쉽습니다. 화면에서 에러를 보고 수동 로그아웃하면 됩니다.
 */
export async function apiFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}
