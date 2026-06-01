import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChecklistResult } from '@audit/database';

export class GenerateFindingDto {
  @IsString()
  controlId!: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  evidence?: string;

  /** Аудиторын өгсөн чеклистийн үр дүн (сануулга) */
  @IsOptional()
  @IsEnum(ChecklistResult)
  result?: ChecklistResult;
}
