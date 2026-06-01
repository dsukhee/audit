import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RiskFactor, RiskTreatment } from '@audit/database';

export class CreateRiskDto {
  @IsString()
  title!: string;

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

  @IsEnum(RiskFactor)
  likelihood!: RiskFactor;

  @IsEnum(RiskFactor)
  impact!: RiskFactor;

  @IsOptional()
  @IsEnum(RiskTreatment)
  treatment?: RiskTreatment;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;
}
