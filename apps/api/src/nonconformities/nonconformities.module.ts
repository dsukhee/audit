import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { NonconformitiesController } from './nonconformities.controller';
import { NonconformitiesService } from './nonconformities.service';

@Module({
  imports: [AuditsModule],
  controllers: [NonconformitiesController],
  providers: [NonconformitiesService],
  exports: [NonconformitiesService],
})
export class NonconformitiesModule {}
