import { Module } from '@nestjs/common';
import { SecurityIncidentsService } from './security-incidents.service';
import { SecurityIncidentsController } from './security-incidents.controller';

@Module({
  controllers: [SecurityIncidentsController],
  providers: [SecurityIncidentsService],
  exports: [SecurityIncidentsService],
})
export class SecurityIncidentsModule {}
