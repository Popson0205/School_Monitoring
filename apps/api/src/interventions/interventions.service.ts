import { Injectable, NotFoundException } from '@nestjs/common';
import { InterventionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';

@Injectable()
export class InterventionsService {
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

  async create(tenantId: string, userId: string, dto: CreateInterventionDto) {
    await this.assertInstitutionInTenant(tenantId, dto.institutionId);
    return this.prisma.intervention.create({
      data: {
        tenantId,
        institutionId: dto.institutionId,
        type: dto.type,
        description: dto.description,
        status: dto.status ?? InterventionStatus.PLANNED,
        priority: dto.priority,
        budget: dto.budget,
        resources: dto.resources as any,
        plannedDate: dto.plannedDate ? new Date(dto.plannedDate) : undefined,
        createdById: userId,
      },
    });
  }

  findAll(tenantId: string, filters?: { status?: string; institutionId?: string }) {
    return this.prisma.intervention.findMany({
      where: {
        tenantId,
        ...(filters?.status ? { status: filters.status as any } : {}),
        ...(filters?.institutionId ? { institutionId: filters.institutionId } : {}),
      },
      include: { institution: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(tenantId: string, id: string, status: InterventionStatus) {
    const existing = await this.prisma.intervention.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new NotFoundException('Intervention not found');
    }

    const timestampFields: Record<string, Date> = {};
    if (status === InterventionStatus.IN_PROGRESS && !existing.startedAt) {
      timestampFields.startedAt = new Date();
    }
    if (status === InterventionStatus.COMPLETED && !existing.completedAt) {
      timestampFields.completedAt = new Date();
    }

    return this.prisma.intervention.update({
      where: { id },
      data: { status, ...timestampFields },
    });
  }
}
