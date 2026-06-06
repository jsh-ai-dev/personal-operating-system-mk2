import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

const PAGE_SIZE = 100;

type PageViewFilters = {
  ipAddresses?: string[];
  emails?: string[];
};

type FilterOption = {
  value: string;
  count: number;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findRecentPageViews(pageInput: number, filters: PageViewFilters = {}) {
    const page = Number.isInteger(pageInput) && pageInput > 0 ? pageInput : 1;
    const where = buildPageViewWhere(filters);
    const emptyFilter = hasEmptyFilter(filters);
    const [items, total, ipGroups, users] = await this.prisma.$transaction([
      this.prisma.pageView.findMany({
        where: emptyFilter ? { id: "__no_page_view_matches__" } : where,
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
      this.prisma.pageView.count({
        where: emptyFilter ? { id: "__no_page_view_matches__" } : where,
      }),
      this.prisma.pageView.groupBy({
        by: ["ipAddress"],
        orderBy: {
          ipAddress: "asc",
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          pageViews: {
            some: {},
          },
        },
        select: {
          email: true,
          _count: {
            select: {
              pageViews: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      filters: {
        ipAddresses: sortFilterOptions(
          ipGroups.map((group) => ({
            value: group.ipAddress,
            count: aggregateCount(group._count),
          })),
        ),
        emails: sortFilterOptions(
          users.map((user) => ({
            value: user.email,
            count: user._count.pageViews,
          })),
        ),
      },
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  }
}

function buildPageViewWhere(filters: PageViewFilters): Prisma.PageViewWhereInput {
  return {
    ...(filters.ipAddresses
      ? {
          ipAddress: {
            in: filters.ipAddresses,
          },
        }
      : {}),
    ...(filters.emails
      ? {
          user: {
            email: {
              in: filters.emails,
            },
          },
        }
      : {}),
  };
}

function hasEmptyFilter(filters: PageViewFilters): boolean {
  return filters.ipAddresses?.length === 0 || filters.emails?.length === 0;
}

function sortFilterOptions(options: FilterOption[]): FilterOption[] {
  return options.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function aggregateCount(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return 0;

  const count = (value as { _all?: unknown })._all;
  return typeof count === "number" ? count : 0;
}
