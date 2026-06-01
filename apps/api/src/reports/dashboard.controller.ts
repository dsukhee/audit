import { Controller, Get } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.reportsService.getDashboard(user);
  }
}
