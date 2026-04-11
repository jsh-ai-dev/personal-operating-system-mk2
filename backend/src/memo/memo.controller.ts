import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { CurrentUserId } from "../common/decorators/current-user.decorator";
import { GetMemosQueryDto } from "./dto/get-memos-query.dto";
import { PatchMemoDto } from "./dto/patch-memo.dto";
import { ReplaceMemoDto } from "./dto/replace-memo.dto";
import { UpsertMemoDto } from "./dto/upsert-memo.dto";
import { MemoService } from "./memo.service";

@Controller("memos")
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Get()
  findByRange(
    @CurrentUserId() userId: string,
    @Query() query: GetMemosQueryDto,
  ) {
    return this.memoService.findByRange(userId, query.from, query.to);
  }

  @Get(":dateKey")
  findOne(@CurrentUserId() userId: string, @Param("dateKey") dateKey: string) {
    return this.memoService.findOne(userId, dateKey);
  }

  /** dateKey를 본문에 넣어 생성·갱신(upsert) */
  @Post()
  upsert(@CurrentUserId() userId: string, @Body() dto: UpsertMemoDto) {
    return this.memoService.createFromBody(userId, dto.dateKey, dto.brief, dto.detail);
  }

  @Put(":dateKey")
  replace(
    @CurrentUserId() userId: string,
    @Param("dateKey") dateKey: string,
    @Body() dto: ReplaceMemoDto,
  ) {
    return this.memoService.replace(userId, dateKey, dto.brief, dto.detail);
  }

  @Patch(":dateKey")
  patch(
    @CurrentUserId() userId: string,
    @Param("dateKey") dateKey: string,
    @Body() dto: PatchMemoDto,
  ) {
    return this.memoService.patch(userId, dateKey, dto);
  }

  @Delete(":dateKey")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: string,
    @Param("dateKey") dateKey: string,
  ) {
    await this.memoService.remove(userId, dateKey);
  }
}
