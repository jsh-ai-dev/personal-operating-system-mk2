import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
} from "@nestjs/common";

import { UpsertWeeklyGoalBodyDto } from "./dto/upsert-weekly-goal-body.dto";
import { WeeklyGoalService } from "./weekly-goal.service";

@Controller("weekly-goals")
export class WeeklyGoalController {
  constructor(private readonly weeklyGoalService: WeeklyGoalService) {}

  @Get("batch")
  findBatch(@Query("keys") keys: string | undefined) {
    const raw = keys?.trim() ?? "";
    if (raw === "") return Promise.resolve([]);
    const list = raw.split(",").map((k) => k.trim()).filter(Boolean);
    return this.weeklyGoalService.findManyByKeys(list);
  }

  @Get(":rangeKey")
  getOne(@Param("rangeKey") rangeKey: string) {
    return this.weeklyGoalService.getOne(rangeKey);
  }

  @Put(":rangeKey")
  put(
    @Param("rangeKey") rangeKey: string,
    @Body() dto: UpsertWeeklyGoalBodyDto,
  ) {
    return this.weeklyGoalService.upsert(rangeKey, dto.body);
  }

  @Delete(":rangeKey")
  @HttpCode(204)
  async remove(@Param("rangeKey") rangeKey: string) {
    await this.weeklyGoalService.remove(rangeKey);
  }
}
