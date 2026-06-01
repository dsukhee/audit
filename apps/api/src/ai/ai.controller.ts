import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AiService } from './ai.service';
import { GenerateFindingDto } from './dto/generate-finding.dto';

@Controller('audits/:auditId/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-finding')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  generateFinding(
    @Param('auditId') auditId: string,
    @Body() dto: GenerateFindingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.aiService.generateFinding(auditId, dto, user);
  }

  @Get()
  findByAudit(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.aiService.findByAudit(auditId, user);
  }
}
