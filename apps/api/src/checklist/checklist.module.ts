import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { NonconformitiesModule } from '../nonconformities/nonconformities.module';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

@Module({
  imports: [AuditsModule, NonconformitiesModule],
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}
