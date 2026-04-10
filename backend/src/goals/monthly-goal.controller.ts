import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
} from "@nestjs/common";

import { UpsertMonthlyGoalBodyDto } from "./dto/upsert-monthly-goal-body.dto";
import { MonthlyGoalService } from "./monthly-goal.service";

@Controller("monthly-goals")
export class MonthlyGoalController {
  constructor(private readonly monthlyGoalService: MonthlyGoalService) {}

  @Get(":yearMonth")
  getOne(@Param("yearMonth") yearMonth: string) {
    return this.monthlyGoalService.getOne(yearMonth);
  }

  @Put(":yearMonth")
  put(
    @Param("yearMonth") yearMonth: string,
    @Body() dto: UpsertMonthlyGoalBodyDto,
  ) {
    return this.monthlyGoalService.upsert(yearMonth, dto.body);
  }

  @Delete(":yearMonth")
  @HttpCode(204)
  async remove(@Param("yearMonth") yearMonth: string) {
    await this.monthlyGoalService.remove(yearMonth);
  }
}
