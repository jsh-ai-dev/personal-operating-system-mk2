import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** JWT 검사를 건너뜁니다 (로그인·헬스체크 등). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
