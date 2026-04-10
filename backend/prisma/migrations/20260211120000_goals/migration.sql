-- CreateTable
CREATE TABLE "monthly_goals" (
    "year_month" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("year_month")
);

-- CreateTable
CREATE TABLE "weekly_goals" (
    "range_key" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("range_key")
);
