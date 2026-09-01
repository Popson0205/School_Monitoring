import {
  PrismaClient,
  OwnershipType,
  UserRole,
  InstitutionType,
  FacilityCategory,
  FacilityCondition,
  SecurityIncidentType,
  SecuritySeverity,
  InterventionType,
  InterventionStatus,
  InterventionPriority,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Ministry of Education',
      type: OwnershipType.GOVERNMENT,
    },
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo-tenant.test' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo-tenant.test',
      passwordHash,
      fullName: 'Demo Admin',
      role: UserRole.TENANT_ADMIN,
    },
  });

  // Sample 2-level region hierarchy: State -> LGA
  const state = await prisma.adminRegion.create({
    data: { tenantId: tenant.id, name: 'FCT', level: 0 },
  });
  const lga = await prisma.adminRegion.create({
    data: { tenantId: tenant.id, name: 'Abuja Municipal', level: 1, parentId: state.id },
  });

  // Sample institutions
  const schoolA = await prisma.institution.create({
    data: {
      tenantId: tenant.id,
      name: 'Central Primary School',
      type: InstitutionType.PRIMARY,
      ownership: OwnershipType.GOVERNMENT,
      lat: 9.0765,
      lng: 7.3986,
      regionId: lga.id,
    },
  });

  const schoolB = await prisma.institution.create({
    data: {
      tenantId: tenant.id,
      name: 'Riverside Secondary School',
      type: InstitutionType.SECONDARY,
      ownership: OwnershipType.PRIVATE,
      lat: 9.0579,
      lng: 7.4951,
      regionId: lga.id,
    },
  });

  // Facilities - schoolA has issues, schoolB is in good shape
  await prisma.facility.createMany({
    data: [
      {
        institutionId: schoolA.id,
        category: FacilityCategory.TOILET,
        condition: FacilityCondition.NOT_FUNCTIONAL,
        notes: 'Blocked drainage, unusable',
      },
      {
        institutionId: schoolA.id,
        category: FacilityCategory.CLASSROOM,
        condition: FacilityCondition.POOR,
        notes: 'Roof leaking in 3 classrooms',
      },
      {
        institutionId: schoolB.id,
        category: FacilityCategory.WATER,
        condition: FacilityCondition.GOOD,
      },
      {
        institutionId: schoolB.id,
        category: FacilityCategory.ELECTRICITY,
        condition: FacilityCondition.GOOD,
      },
    ],
  });

  await prisma.enrollmentRecord.create({
    data: {
      institutionId: schoolA.id,
      term: '2026-T1',
      studentCount: 850,
      staffCount: 32,
    },
  });

  // A security incident driving the "rescue/security" side of the dashboard
  await prisma.securityIncident.create({
    data: {
      tenantId: tenant.id,
      institutionId: schoolA.id,
      type: SecurityIncidentType.INTRUSION,
      severity: SecuritySeverity.HIGH,
      description: 'Unauthorized entry reported by night guard',
      occurredAt: new Date(),
      reportedById: admin.id,
    },
  });

  // An intervention already in motion, tracked through to completion
  await prisma.intervention.create({
    data: {
      tenantId: tenant.id,
      institutionId: schoolA.id,
      type: InterventionType.INFRASTRUCTURE_REPAIR,
      description: 'Toilet block rehabilitation',
      status: InterventionStatus.IN_PROGRESS,
      priority: InterventionPriority.HIGH,
      budget: 1500000,
      resources: [{ item: 'Plumbing kits', quantity: 4 }],
      createdById: admin.id,
      startedAt: new Date(),
    },
  });

  console.log('Seed complete. Login with admin@demo-tenant.test / ChangeMe123! (change immediately).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
