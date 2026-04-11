import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";

/** JWT(`JwtStrategy`)에서 온 현재 사용자 ID (`sub`). */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<{ user?: { sub: string } }>();
    const id = req.user?.sub;
    if (!id) {
      throw new UnauthorizedException();
    }
    return id;
  },
);
