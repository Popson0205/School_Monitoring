import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
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

  async create(tenantId: string, dto: CreateEnrollmentDto) {
    await this.assertInstitutionInTenant(tenantId, dto.institutionId);
    return this.prisma.enrollmentRecord.create({ data: dto });
  }

  async findForInstitution(tenantId: string, institutionId: string) {
    await this.assertInstitutionInTenant(tenantId, institutionId);
    return this.prisma.enrollmentRecord.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
