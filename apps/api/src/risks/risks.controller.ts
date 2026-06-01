import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { RisksService } from './risks.service';

@Controller()
export class RisksController {
  constructor(private readonly service: RisksService) {}

  @Get('audits/:auditId/risks')
  findByAudit(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByAudit(auditId, user);
  }

  @Post('audits/:auditId/risks')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  create(
    @Param('auditId') auditId: string,
    @Body() dto: CreateRiskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(auditId, dto, user);
  }

  @Get('risks/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch('risks/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRiskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete('risks/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user);
  }
}
