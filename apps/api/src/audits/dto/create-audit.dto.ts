import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsString()
  organizationId!: string;

  @IsString()
  standardId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  /** Хэрэв заагаагүй бол хүсэлт гаргасан хэрэглэгч (auditor) lead болно. */
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
  @IsDateString()
  plannedStartDate?: string;

  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;
}
