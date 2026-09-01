import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminRegionDto } from './dto/create-admin-region.dto';

@Injectable()
export class AdminRegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAdminRegionDto) {
    if (dto.parentId) {
      const parent = await this.prisma.adminRegion.findFirst({
        where: { id: dto.parentId, tenantId },
      });
      if (!parent) {
        throw new NotFoundException('Parent region not found for this tenant');
      }
    }
    return this.prisma.adminRegion.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.adminRegion.findMany({
      where: { tenantId },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  findTree(tenantId: string) {
    // Flat list returned; the client builds the tree from parentId since
    // hierarchy depth is configurable per tenant and can't be assumed fixed.
    return this.findAll(tenantId);
  }

  /**
   * Returns [regionId, ...all descendant region ids] so callers can filter
   * institutions by a region at ANY level (e.g. selecting a State should
   * include every LGA and School beneath it, however deep that tenant's
   * hierarchy goes).
   */
  async resolveDescendantIds(tenantId: string, regionId: string): Promise<string[]> {
    const all = await this.prisma.adminRegion.findMany({
      where: { tenantId },
      select: { id: true, parentId: true },
    });

    const childrenByParent = new Map<string, string[]>();
    for (const region of all) {
      if (!region.parentId) continue;
      const list = childrenByParent.get(region.parentId) ?? [];
      list.push(region.id);
      childrenByParent.set(region.parentId, list);
    }

    const result: string[] = [regionId];
    const queue = [regionId];
    while (queue.length) {
      const current = queue.shift()!;
      const children = childrenByParent.get(current) ?? [];
      for (const childId of children) {
        result.push(childId);
        queue.push(childId);
      }
    }
    return result;
  }
}
