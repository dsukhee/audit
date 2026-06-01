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
import { AuditsService } from './audits.service';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  create(@Body() dto: CreateAuditDto, @CurrentUser() user: AuthUser) {
    return this.auditsService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.auditsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.auditsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAuditDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.auditsService.update(id, dto, user);
  }

  @Post(':id/team')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  addTeamMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.auditsService.addTeamMember(id, dto, user);
  }

  @Delete(':id/team/:memberId')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  removeTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.auditsService.removeTeamMember(id, memberId, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.auditsService.remove(id, user);
  }
}
