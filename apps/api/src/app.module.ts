import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
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
