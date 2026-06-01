import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuditStatus } from '@audit/database';

export class UpdateAuditDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  leadAuditorId?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsDateString()
  plannedStartDate?: string;

  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;

  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;
}
