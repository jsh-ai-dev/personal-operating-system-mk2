import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
} from "@nestjs/common";

import { CurrentUserId } from "../common/decorators/current-user.decorator";
import { UpsertMonthlyGoalBodyDto } from "./dto/upsert-monthly-goal-body.dto";
import { MonthlyGoalService } from "./monthly-goal.service";

@Controller("monthly-goals")
export class MonthlyGoalController {
  constructor(private readonly monthlyGoalService: MonthlyGoalService) {}

  @Get(":yearMonth")
  getOne(@CurrentUserId() userId: string, @Param("yearMonth") yearMonth: string) {
    return this.monthlyGoalService.getOne(userId, yearMonth);
  }

  @Put(":yearMonth")
  put(
    @CurrentUserId() userId: string,
    @Param("yearMonth") yearMonth: string,
    @Body() dto: UpsertMonthlyGoalBodyDto,
  ) {
    return this.monthlyGoalService.upsert(userId, yearMonth, dto.body);
  }

  @Delete(":yearMonth")
  @HttpCode(204)
  async remove(
    @CurrentUserId() userId: string,
    @Param("yearMonth") yearMonth: string,
  ) {
    await this.monthlyGoalService.remove(userId, yearMonth);
  }
}
