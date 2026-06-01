import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CapaStatus } from '@audit/database';

export class UpdateCapaDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  ownerLabel?: string;

  @IsOptional()
  @IsEnum(CapaStatus)
  status?: CapaStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class VerifyCapaDto {
  @IsOptional()
  @IsString()
  verificationNote?: string;
}
