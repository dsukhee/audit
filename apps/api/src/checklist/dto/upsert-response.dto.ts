import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChecklistResult } from '@audit/database';

export class UpsertResponseDto {
  @IsOptional()
  @IsEnum(ChecklistResult)
  result?: ChecklistResult;

  @IsOptional()
  @IsString()
  comment?: string;
}
