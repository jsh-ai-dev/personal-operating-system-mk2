import { Module } from "@nestjs/common";

import { MonthlyGoalController } from "./monthly-goal.controller";
import { MonthlyGoalService } from "./monthly-goal.service";
import { WeeklyGoalController } from "./weekly-goal.controller";
import { WeeklyGoalService } from "./weekly-goal.service";

@Module({
  controllers: [MonthlyGoalController, WeeklyGoalController],
  providers: [MonthlyGoalService, WeeklyGoalService],
})
export class GoalsModule {}
