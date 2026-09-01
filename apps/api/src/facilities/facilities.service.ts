import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacilityDto } from './dto/create-facility.dto';

@Injectable()
export class FacilitiesService {
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

  async create(tenantId: string, dto: CreateFacilityDto) {
    await this.assertInstitutionInTenant(tenantId, dto.institutionId);
    return this.prisma.facility.create({
      data: {
        ...dto,
        lastInspectedAt: new Date(),
      },
    });
  }

  async findForInstitution(tenantId: string, institutionId: string) {
    await this.assertInstitutionInTenant(tenantId, institutionId);
    return this.prisma.facility.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
