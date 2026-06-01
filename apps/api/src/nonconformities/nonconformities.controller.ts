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
import { CreateNonconformityDto } from './dto/create-nonconformity.dto';
import { UpdateNonconformityDto } from './dto/update-nonconformity.dto';
import { NonconformitiesService } from './nonconformities.service';

@Controller()
export class NonconformitiesController {
  constructor(private readonly service: NonconformitiesService) {}

  @Get('audits/:auditId/nonconformities')
  findByAudit(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByAudit(auditId, user);
  }

  @Post('audits/:auditId/nonconformities')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  create(
    @Param('auditId') auditId: string,
    @Body() dto: CreateNonconformityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(auditId, dto, user);
  }

  @Get('nonconformities/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch('nonconformities/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNonconformityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete('nonconformities/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user);
  }
}
