import { Injectable } from '@nestjs/common';
import { FacilityCondition, IncidentStatus, InterventionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRegionsService } from '../admin-regions/admin-regions.service';

interface PriorityResult {
  institutionId: string;
  institutionName: string;
  regionId: string | null;
  score: number;
  reasons: string[];
  openIncidentCount: number;
  criticalFacilityCount: number;
  activeInterventionCount: number;
}

const OPEN_INCIDENT_STATUSES: IncidentStatus[] = [
  IncidentStatus.REPORTED,
  IncidentStatus.VERIFIED,
  IncidentStatus.RESPONSE_DISPATCHED,
];

const ACTIVE_INTERVENTION_STATUSES: InterventionStatus[] = [
  InterventionStatus.PLANNED,
  InterventionStatus.APPROVED,
  InterventionStatus.IN_PROGRESS,
];

const SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 20,
  HIGH: 10,
  MEDIUM: 5,
  LOW: 2,
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminRegionsService: AdminRegionsService,
  ) {}

  /**
   * Ranks institutions by an urgency score combining facility condition,
   * missing critical infrastructure, open security incidents, and enrollment
   * size. This is what turns raw field data into an actionable list for
   * ministry/management decision-making: "these N schools need attention first."
   */
  async priorityRanking(
    tenantId: string,
    options?: { regionId?: string; limit?: number },
  ): Promise<PriorityResult[]> {
    let institutionIdFilter: string[] | undefined;
    if (options?.regionId) {
      const regionIds = await this.adminRegionsService.resolveDescendantIds(
        tenantId,
        options.regionId,
      );
      const institutions = await this.prisma.institution.findMany({
        where: { tenantId, regionId: { in: regionIds } },
        select: { id: true },
      });
      institutionIdFilter = institutions.map((i) => i.id);
    }

    const institutions = await this.prisma.institution.findMany({
      where: {
        tenantId,
        ...(institutionIdFilter ? { id: { in: institutionIdFilter } } : {}),
      },
      include: {
        facilities: true,
        enrollmentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
        securityIncidents: { where: { status: { in: OPEN_INCIDENT_STATUSES } } },
        interventions: { where: { status: { in: ACTIVE_INTERVENTION_STATUSES } } },
      },
    });

    const results: PriorityResult[] = institutions.map((inst) => {
      let score = 0;
      const reasons: string[] = [];

      // Facility condition
      let criticalFacilityCount = 0;
      for (const facility of inst.facilities) {
        if (facility.condition === FacilityCondition.NOT_FUNCTIONAL) {
          score += 5;
          criticalFacilityCount += 1;
        } else if (facility.condition === FacilityCondition.POOR) {
          score += 3;
          criticalFacilityCount += 1;
        } else if (facility.condition === FacilityCondition.FAIR) {
          score += 1;
        }
      }
      if (criticalFacilityCount > 0) {
        reasons.push(`${criticalFacilityCount} facility record(s) in poor/non-functional condition`);
      }

      // Missing critical categories entirely (no record at all == unknown/likely absent)
      const presentCategories = new Set(inst.facilities.map((f) => f.category));
      const criticalCategories = ['WATER', 'TOILET', 'ELECTRICITY'];
      const missing = criticalCategories.filter((c) => !presentCategories.has(c as any));
      if (missing.length > 0) {
        score += missing.length * 4;
        reasons.push(`No record of: ${missing.join(', ').toLowerCase()}`);
      }

      // Open security incidents - weighted heavily, this drives rescue/security response
      let incidentScore = 0;
      for (const incident of inst.securityIncidents) {
        incidentScore += SEVERITY_WEIGHT[incident.severity] ?? 0;
      }
      if (inst.securityIncidents.length > 0) {
        score += incidentScore;
        reasons.push(`${inst.securityIncidents.length} open security incident(s)`);
      }

      // Enrollment size - larger schools raise the stakes of any given issue
      const latestEnrollment = inst.enrollmentRecords[0];
      if (latestEnrollment && score > 0) {
        const sizeMultiplier = Math.min(1 + latestEnrollment.studentCount / 1000, 2);
        score = score * sizeMultiplier;
      }

      return {
        institutionId: inst.id,
        institutionName: inst.name,
        regionId: inst.regionId,
        score: Math.round(score * 10) / 10,
        reasons,
        openIncidentCount: inst.securityIncidents.length,
        criticalFacilityCount,
        activeInterventionCount: inst.interventions.length,
      };
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options?.limit ?? 50);
  }

  async summary(tenantId: string) {
    const [totalInstitutions, openSecurityIncidents, activeInterventions, poorOrWorseFacilities] =
      await Promise.all([
        this.prisma.institution.count({ where: { tenantId } }),
        this.prisma.securityIncident.count({
          where: { tenantId, status: { in: OPEN_INCIDENT_STATUSES } },
        }),
        this.prisma.intervention.count({
          where: { tenantId, status: { in: ACTIVE_INTERVENTION_STATUSES } },
        }),
        this.prisma.facility.count({
          where: {
            institution: { tenantId },
            condition: { in: [FacilityCondition.POOR, FacilityCondition.NOT_FUNCTIONAL] },
          },
        }),
      ]);

    const ranked = await this.priorityRanking(tenantId, { limit: 1000 });
    const criticalPriorityCount = ranked.filter((r) => r.score >= 15).length;

    return {
      totalInstitutions,
      criticalPriorityCount,
      openSecurityIncidents,
      activeInterventions,
      facilitiesNeedingAttention: poorOrWorseFacilities,
    };
  }
}
