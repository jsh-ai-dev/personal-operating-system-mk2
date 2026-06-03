import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

const PAGE_SIZE = 100;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecentPageViews(pageInput: number) {
    const page = Number.isInteger(pageInput) && pageInput > 0 ? pageInput : 1;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.pageView.findMany({
        orderBy: { occurredAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      this.prisma.pageView.count(),
    ]);

    return {
      items,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  }
}
