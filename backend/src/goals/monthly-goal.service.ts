import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

const YEAR_MONTH_RE = /^\d{4}-\d{2}$/;

@Injectable()
export class MonthlyGoalService {
  constructor(private readonly prisma: PrismaService) {}

  assertYearMonth(yearMonth: string): void {
    if (!YEAR_MONTH_RE.test(yearMonth)) {
      throw new BadRequestException("yearMonth must be YYYY-MM");
    }
  }

  async getOne(yearMonth: string) {
    this.assertYearMonth(yearMonth);
    const row = await this.prisma.monthlyGoal.findUnique({
      where: { yearMonth },
    });
    return { yearMonth, body: row?.body ?? "" };
  }

  async upsert(yearMonth: string, body: string) {
    this.assertYearMonth(yearMonth);
    const row = await this.prisma.monthlyGoal.upsert({
      where: { yearMonth },
      create: { yearMonth, body },
      update: { body },
    });
    return { yearMonth: row.yearMonth, body: row.body };
  }

  async remove(yearMonth: string) {
    this.assertYearMonth(yearMonth);
    await this.prisma.monthlyGoal.deleteMany({ where: { yearMonth } });
  }
}
