import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/** 로컬 개발 전용 — 프로덕션에서는 절대 사용하지 마세요. */
const DEV_FALLBACK =
  "dev-only-jwt-secret-min-32-chars-change-in-backend-dot-env";

const logger = new Logger("Auth");

/**
 * JWT 서명/검증에 쓰는 비밀값.
 * 프로덕션에서는 `JWT_SECRET` 필수, 개발에서는 없으면 안내 로그와 함께 기본값 사용.
 */
export function resolveJwtSecret(config: ConfigService): string {
  const fromEnv = config.get<string>("JWT_SECRET")?.trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET 환경 변수가 필요합니다. auth-service/.env 또는 배포 환경에 설정하세요.",
    );
  }

  logger.warn(
    "JWT_SECRET이 없어 개발용 기본값을 사용합니다. .env에 JWT_SECRET을 추가하는 것을 권장합니다.",
  );
  return DEV_FALLBACK;
}
