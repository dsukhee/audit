import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChecklistService } from './checklist.service';
import { UpsertResponseDto } from './dto/upsert-response.dto';

@Controller('audits/:auditId/checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get()
  getChecklist(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.checklistService.getChecklist(auditId, user);
  }

  @Put(':controlId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  upsertResponse(
    @Param('auditId') auditId: string,
    @Param('controlId') controlId: string,
    @Body() dto: UpsertResponseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.checklistService.upsertResponse(auditId, controlId, dto, user);
  }
}
