-- 기존 행은 사용자 구분이 없어 삭제 후 스키마 변경 (멀티 테넌트)
TRUNCATE TABLE "calendar_memos" CASCADE;
TRUNCATE TABLE "monthly_goals" CASCADE;
TRUNCATE TABLE "weekly_goals" CASCADE;

-- calendar_memos: (user_id, date_key) 유일
ALTER TABLE "calendar_memos" DROP CONSTRAINT IF EXISTS "calendar_memos_date_key_key";

ALTER TABLE "calendar_memos" ADD COLUMN "user_id" TEXT NOT NULL;

ALTER TABLE "calendar_memos" ADD CONSTRAINT "calendar_memos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "calendar_memos_user_id_date_key_key" ON "calendar_memos"("user_id", "date_key");

-- monthly_goals: 복합 PK (user_id, year_month)
ALTER TABLE "monthly_goals" DROP CONSTRAINT IF EXISTS "monthly_goals_pkey";

ALTER TABLE "monthly_goals" ADD COLUMN "user_id" TEXT NOT NULL;

ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "monthly_goals" ADD CONSTRAINT "monthly_goals_pkey" PRIMARY KEY ("user_id", "year_month");

-- weekly_goals: 복합 PK (user_id, range_key)
ALTER TABLE "weekly_goals" DROP CONSTRAINT IF EXISTS "weekly_goals_pkey";

ALTER TABLE "weekly_goals" ADD COLUMN "user_id" TEXT NOT NULL;

ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("user_id", "range_key");
