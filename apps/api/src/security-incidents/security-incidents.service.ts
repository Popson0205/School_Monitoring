import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSecurityIncidentDto } from './dto/create-security-incident.dto';

@Injectable()
export class SecurityIncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertInstitutionInTenant(tenantId: string, institutionId: string) {
    const institution = await this.prisma.institution.findFirst({
      where: { id: institutionId, tenantId },
      select: { id: true },
    });
    if (!institution) {
      throw new NotFoundException('Institution not found for this tenant');
    }
  }

  async create(tenantId: string, userId: string, dto: CreateSecurityIncidentDto) {
    await this.assertInstitutionInTenant(tenantId, dto.institutionId);
    return this.prisma.securityIncident.create({
      data: {
        tenantId,
        institutionId: dto.institutionId,
        type: dto.type,
        severity: dto.severity,
        description: dto.description,
        occurredAt: new Date(dto.occurredAt),
        reportedById: userId,
      },
    });
  }

  findAll(tenantId: string, filters?: { status?: string; severity?: string }) {
    return this.prisma.securityIncident.findMany({
      where: {
        tenantId,
        ...(filters?.status ? { status: filters.status as any } : {}),
        ...(filters?.severity ? { severity: filters.severity as any } : {}),
      },
      include: { institution: { select: { id: true, name: true } } },
      orderBy: { occurredAt: 'desc' },
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: IncidentStatus,
    responseNotes?: string,
  ) {
    const existing = await this.prisma.securityIncident.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new NotFoundException('Security incident not found');
    }
    return this.prisma.securityIncident.update({
      where: { id },
      data: { status, ...(responseNotes ? { responseNotes } : {}) },
    });
  }
}
