import { IsEnum, IsOptional } from 'class-validator';
import { ReportFormat, ReportType } from '@audit/database';

export class GenerateReportDto {
  @IsEnum(ReportType)
  type!: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}
