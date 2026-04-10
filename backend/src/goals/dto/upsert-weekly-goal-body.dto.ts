import { IsString, MaxLength } from "class-validator";

export class UpsertWeeklyGoalBodyDto {
  @IsString()
  @MaxLength(20000)
  body!: string;
}
