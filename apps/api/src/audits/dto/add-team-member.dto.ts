import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AuditTeamRole } from '@audit/database';

export class AddTeamMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsEnum(AuditTeamRole)
  teamRole?: AuditTeamRole;
}
