import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type { JwtRevocationPayload } from "./jwt-revocation.service";
import { JwtRevocationService } from "./jwt-revocation.service";
import { resolveJwtSecret } from "./resolve-jwt-secret";

/** `req.user`에 붙는 값 (컨트롤러에서 사용) */
export type JwtUser = {
  sub: string;
  email: string;
  jti?: string;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly revocation: JwtRevocationService,
  ) {
    const secret = resolveJwtSecret(config);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtRevocationPayload & { email: string }): Promise<JwtUser> {
    await this.revocation.assertTokenAllowed(payload);
    return {
      sub: payload.sub,
      email: payload.email,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
