import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCapaDto {
  @IsString()
  action!: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  /** Чөлөөт текст эзэмшигч — жишээ: "IT Manager" */
  @IsOptional()
  @IsString()
  ownerLabel?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
