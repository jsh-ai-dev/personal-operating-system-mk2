import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

const RANGE_KEY_RE = /^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class WeeklyGoalService {
  constructor(private readonly prisma: PrismaService) {}

  assertRangeKey(rangeKey: string): void {
    if (!RANGE_KEY_RE.test(rangeKey)) {
      throw new BadRequestException(
        "rangeKey must be YYYY-MM-DD_YYYY-MM-DD",
      );
    }
  }

  async findManyByKeys(keys: string[]) {
    const unique = [...new Set(keys.map((k) => k.trim()).filter(Boolean))];
    for (const k of unique) this.assertRangeKey(k);
    if (unique.length === 0) return [];
    const rows = await this.prisma.weeklyGoal.findMany({
      where: { rangeKey: { in: unique } },
    });
    const byKey = new Map(rows.map((r) => [r.rangeKey, r.body]));
    return unique.map((rangeKey) => ({
      rangeKey,
      body: byKey.get(rangeKey) ?? "",
    }));
  }

  async getOne(rangeKey: string) {
    this.assertRangeKey(rangeKey);
    const row = await this.prisma.weeklyGoal.findUnique({
      where: { rangeKey },
    });
    return { rangeKey, body: row?.body ?? "" };
  }

  async upsert(rangeKey: string, body: string) {
    this.assertRangeKey(rangeKey);
    const row = await this.prisma.weeklyGoal.upsert({
      where: { rangeKey },
      create: { rangeKey, body },
      update: { body },
    });
    return { rangeKey: row.rangeKey, body: row.body };
  }

  async remove(rangeKey: string) {
    this.assertRangeKey(rangeKey);
    await this.prisma.weeklyGoal.deleteMany({ where: { rangeKey } });
  }
}
