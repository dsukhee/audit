import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { NcCategory, NcStatus } from '@audit/database';

export class UpdateNonconformityDto {
  @IsOptional()
  @IsEnum(NcCategory)
  category?: NcCategory;

  @IsOptional()
  @IsString()
  finding?: string;

  @IsOptional()
  @IsString()
  clause?: string;

  @IsOptional()
  @IsString()
  evidenceSummary?: string;

  @IsOptional()
  @IsString()
  impact?: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsEnum(NcStatus)
  status?: NcStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
