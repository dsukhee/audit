import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuditsModule } from './audits/audits.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { CapaModule } from './capa/capa.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ChecklistModule } from './checklist/checklist.module';
import { EvidenceModule } from './evidence/evidence.module';
import { HealthController } from './health/health.controller';
import { NonconformitiesModule } from './nonconformities/nonconformities.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { RisksModule } from './risks/risks.module';
import { StandardsModule } from './standards/standards.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    StandardsModule,
    AuditsModule,
    ChecklistModule,
    EvidenceModule,
    NonconformitiesModule,
    CapaModule,
    RisksModule,
    AiModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Бүх endpoint default-аар хамгаалагдсан (JWT). @Public() decorator-оор гаргана.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Роль-д суурилсан хандалт (@Roles(...))
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
