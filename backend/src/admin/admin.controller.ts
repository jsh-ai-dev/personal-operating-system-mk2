import { Controller, ForbiddenException, Get, Query, Req } from "@nestjs/common";
import type { Request } from "express";

import type { JwtUser } from "../auth/jwt.strategy";
import { AdminService } from "./admin.service";

const ADMIN_EMAIL = "admin@gmail.com";

type AuthedRequest = Request & { user: JwtUser };

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("page-views")
  findPageViews(
    @Req() request: AuthedRequest,
    @Query("page") page?: string,
    @Query("ips") ips?: string,
    @Query("emails") emails?: string,
  ) {
    if (request.user.email.toLowerCase() !== ADMIN_EMAIL) {
      throw new ForbiddenException("Admin only");
    }

    return this.adminService.findRecentPageViews(Number(page), {
      ipAddresses: parseCsvFilter(ips),
      emails: parseCsvFilter(emails),
    });
  }
}

function parseCsvFilter(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
