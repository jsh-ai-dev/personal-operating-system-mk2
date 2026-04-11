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

  async findManyByKeys(userId: string, keys: string[]) {
    const unique = [...new Set(keys.map((k) => k.trim()).filter(Boolean))];
    for (const k of unique) this.assertRangeKey(k);
    if (unique.length === 0) return [];
    const rows = await this.prisma.weeklyGoal.findMany({
      where: {
        userId,
        rangeKey: { in: unique },
      },
    });
    const byKey = new Map(rows.map((r) => [r.rangeKey, r.body]));
    return unique.map((rangeKey) => ({
      rangeKey,
      body: byKey.get(rangeKey) ?? "",
    }));
  }

  async getOne(userId: string, rangeKey: string) {
    this.assertRangeKey(rangeKey);
    const row = await this.prisma.weeklyGoal.findUnique({
      where: { userId_rangeKey: { userId, rangeKey } },
    });
    return { rangeKey, body: row?.body ?? "" };
  }

  async upsert(userId: string, rangeKey: string, body: string) {
    this.assertRangeKey(rangeKey);
    const row = await this.prisma.weeklyGoal.upsert({
      where: { userId_rangeKey: { userId, rangeKey } },
      create: { userId, rangeKey, body },
      update: { body },
    });
    return { rangeKey: row.rangeKey, body: row.body };
  }

  async remove(userId: string, rangeKey: string) {
    this.assertRangeKey(rangeKey);
    await this.prisma.weeklyGoal.deleteMany({
      where: { userId, rangeKey },
    });
  }
}
