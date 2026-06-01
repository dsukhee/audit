import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { DashboardController } from './dashboard.controller';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [AuditsModule],
  controllers: [ReportsController, DashboardController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
