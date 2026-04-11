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

import { CurrentUserId } from "../common/decorators/current-user.decorator";
import { UpsertWeeklyGoalBodyDto } from "./dto/upsert-weekly-goal-body.dto";
import { WeeklyGoalService } from "./weekly-goal.service";

@Controller("weekly-goals")
export class WeeklyGoalController {
  constructor(private readonly weeklyGoalService: WeeklyGoalService) {}

  @Get("batch")
  findBatch(
    @CurrentUserId() userId: string,
    @Query("keys") keys: string | undefined,
  ) {
    const raw = keys?.trim() ?? "";
    if (raw === "") return Promise.resolve([]);
    const list = raw.split(",").map((k) => k.trim()).filter(Boolean);
    return this.weeklyGoalService.findManyByKeys(userId, list);
  }

  @Get(":rangeKey")
  getOne(@CurrentUserId() userId: string, @Param("rangeKey") rangeKey: string) {
    return this.weeklyGoalService.getOne(userId, rangeKey);
  }

  @Put(":rangeKey")
  put(
    @CurrentUserId() userId: string,
    @Param("rangeKey") rangeKey: string,
    @Body() dto: UpsertWeeklyGoalBodyDto,
  ) {
    return this.weeklyGoalService.upsert(userId, rangeKey, dto.body);
  }

  @Delete(":rangeKey")
  @HttpCode(204)
  async remove(
    @CurrentUserId() userId: string,
    @Param("rangeKey") rangeKey: string,
  ) {
    await this.weeklyGoalService.remove(userId, rangeKey);
  }
}
