import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RiskFactor, RiskStatus, RiskTreatment } from '@audit/database';

export class UpdateRiskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  threat?: string;

  @IsOptional()
  @IsString()
  vulnerability?: string;

  @IsOptional()
  @IsEnum(RiskFactor)
  likelihood?: RiskFactor;

  @IsOptional()
  @IsEnum(RiskFactor)
  impact?: RiskFactor;

  @IsOptional()
  @IsEnum(RiskTreatment)
  treatment?: RiskTreatment;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;
}
