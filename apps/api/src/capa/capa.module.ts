import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { CapaController } from './capa.controller';
import { CapaService } from './capa.service';

@Module({
  imports: [AuditsModule],
  controllers: [CapaController],
  providers: [CapaService],
  exports: [CapaService],
})
export class CapaModule {}
