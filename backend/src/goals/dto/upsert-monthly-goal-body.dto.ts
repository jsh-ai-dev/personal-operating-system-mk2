import { IsString, MaxLength } from "class-validator";

export class UpsertMonthlyGoalBodyDto {
  @IsString()
  @MaxLength(20000)
  body!: string;
}
