import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string, filters?: { regionId?: string; type?: string }) {
    return this.prisma.institution.findMany({
      where: {
        tenantId,
        ...(filters?.regionId ? { regionId: filters.regionId } : {}),
        ...(filters?.type ? { type: filters.type as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const institution = await this.prisma.institution.findFirst({
      where: { id, tenantId },
      include: { facilities: true, enrollmentRecords: true },
    });
    if (!institution) {
      throw new NotFoundException('Institution not found');
    }
    return institution;
  }

  async update(tenantId: string, id: string, dto: UpdateInstitutionDto) {
    await this.findOne(tenantId, id); // ensures tenant ownership, throws if not found
    return this.prisma.institution.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.institution.delete({ where: { id } });
    return { deleted: true };
  }
}
