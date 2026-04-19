import { Module } from "@nestjs/common";
import { JwtModule, type JwtSignOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";

import { PrismaModule } from "../prisma/prisma.module";
import { JwtRevocationService } from "./jwt-revocation.service";
import { JwtStrategy } from "./jwt.strategy";
import { resolveJwtSecret } from "./resolve-jwt-secret";

/**
 * JWT 검증 전용 (auth-service가 발급한 토큰).
 * 로그인·회원가입은 auth-service로 분리되었습니다.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = resolveJwtSecret(config);
        const expiresIn = (config.get<string>("JWT_EXPIRES_IN") ?? "7d") as NonNullable<
          JwtSignOptions["expiresIn"]
        >;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtRevocationService, JwtStrategy],
  exports: [JwtModule, JwtRevocationService],
})
export class JwtAuthModule {}
