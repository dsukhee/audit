import { IsOptional, IsString } from 'class-validator';

/** Multipart form-ийн нэмэлт талбарууд (файлаас гадна). */
export class CreateEvidenceDto {
  @IsOptional()
  @IsString()
  controlId?: string;

  @IsOptional()
  @IsString()
  checklistResponseId?: string;

  @IsOptional()
  @IsString()
  nonconformityId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
