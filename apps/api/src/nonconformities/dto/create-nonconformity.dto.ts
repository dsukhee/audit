import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { NcCategory } from '@audit/database';

export class CreateNonconformityDto {
  @IsEnum(NcCategory)
  category!: NcCategory;

  @IsString()
  finding!: string;

  @IsOptional()
  @IsString()
  clause?: string;

  @IsOptional()
  @IsString()
  controlId?: string;

  @IsOptional()
  @IsString()
  checklistResponseId?: string;

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
  @IsDateString()
  dueDate?: string;
}
