import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { HealthModule } from './health/health.module';
import { AdminRegionsModule } from './admin-regions/admin-regions.module';
import { InterventionsModule } from './interventions/interventions.module';
import { SecurityIncidentsModule } from './security-incidents/security-incidents.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    InstitutionsModule,
    FacilitiesModule,
    EnrollmentModule,
    HealthModule,
    AdminRegionsModule,
    InterventionsModule,
    SecurityIncidentsModule,
    DashboardModule,
  ],
})
export class AppModule {}
