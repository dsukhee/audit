import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReportFormat, UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Аудитын real-time аналитик (тайлан үүсгэхгүйгээр). */
  @Get('audits/:auditId/analytics')
  analytics(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.buildAuditAnalytics(auditId);
  }

  @Get('audits/:auditId/reports')
  list(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.listReports(auditId, user);
  }

  @Post('audits/:auditId/reports')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  generate(
    @Param('auditId') auditId: string,
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reportsService.generateReport(
      auditId,
      dto.type,
      dto.format ?? ReportFormat.PDF,
      user,
    );
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reportsService.getReport(id, user);
  }
}
