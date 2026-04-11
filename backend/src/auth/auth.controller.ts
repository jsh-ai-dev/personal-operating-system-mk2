import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { minutes, Throttle } from "@nestjs/throttler";
import type { Request } from "express";

import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import type { JwtUser } from "./jwt.strategy";

type AuthedRequest = Request & { user: JwtUser };

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 8, ttl: minutes(60) } })
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 12, ttl: minutes(15) } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** JWT가 유효하면 현재 사용자 (BFF·세션 확인용) */
  @Get("me")
  getMe(@Req() req: AuthedRequest) {
    const u = req.user;
    return { user: { id: u.sub, email: u.email } };
  }

  /** 현재 토큰을 Redis 블랙리스트에 올린 뒤 클라이언트는 쿠키 삭제 */
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() req: AuthedRequest) {
    return this.authService.logout(req.user);
  }

  /** 모든 기기 세션 무효화 — 세션 버전만 올리고, 기존 JWT는 전부 거부 */
  @Post("sessions/revoke-all")
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeAllSessions(@Req() req: AuthedRequest) {
    return this.authService.revokeAllSessions(req.user.sub);
  }
}
