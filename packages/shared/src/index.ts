// Shared types for the Geospatial School Monitoring Platform
// Used by: apps/api, apps/web, apps/mobile

export enum InstitutionType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  UNIVERSITY = 'UNIVERSITY',
}

export enum OwnershipType {
  GOVERNMENT = 'GOVERNMENT',
  PRIVATE = 'PRIVATE',
}

export enum FacilityCategory {
  CLASSROOM = 'CLASSROOM',
  TOILET = 'TOILET',
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  LIBRARY = 'LIBRARY',
  LABORATORY = 'LABORATORY',
  OTHER = 'OTHER',
}

export enum FacilityCondition {
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  NOT_FUNCTIONAL = 'NOT_FUNCTIONAL',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // platform-level (us)
  TENANT_ADMIN = 'TENANT_ADMIN', // ministry / school-network admin
  INSPECTOR = 'INSPECTOR', // field enumerator / inspector
  SCHOOL_ADMIN = 'SCHOOL_ADMIN', // individual school user
}

export enum InterventionType {
  MATERIAL_DISTRIBUTION = 'MATERIAL_DISTRIBUTION',
  INFRASTRUCTURE_REPAIR = 'INFRASTRUCTURE_REPAIR',
  SECURITY_DEPLOYMENT = 'SECURITY_DEPLOYMENT',
  RESCUE_OPERATION = 'RESCUE_OPERATION',
  OTHER = 'OTHER',
}

export enum InterventionStatus {
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum InterventionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SecurityIncidentType {
  INTRUSION = 'INTRUSION',
  KIDNAPPING_THREAT = 'KIDNAPPING_THREAT',
  ARMED_ATTACK = 'ARMED_ATTACK',
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  FIRE = 'FIRE',
  STRUCTURAL_HAZARD = 'STRUCTURAL_HAZARD',
  OTHER = 'OTHER',
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  VERIFIED = 'VERIFIED',
  RESPONSE_DISPATCHED = 'RESPONSE_DISPATCHED',
  RESOLVED = 'RESOLVED',
  FALSE_ALARM = 'FALSE_ALARM',
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface InstitutionDTO {
  id: string;
  tenantId: string;
  name: string;
  type: InstitutionType;
  ownership: OwnershipType;
  location: GeoPoint;
  address?: string;
  regionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitutionDTO {
  name: string;
  type: InstitutionType;
  ownership: OwnershipType;
  location: GeoPoint;
  address?: string;
  regionId?: string;
}

export interface AdminRegionDTO {
  id: string;
  tenantId: string;
  name: string;
  level: number;
  parentId?: string;
}

export interface InterventionDTO {
  id: string;
  institutionId: string;
  type: InterventionType;
  description?: string;
  status: InterventionStatus;
  priority: InterventionPriority;
  budget?: number;
  resources?: Array<{ item: string; quantity: number }>;
  plannedDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface SecurityIncidentDTO {
  id: string;
  institutionId: string;
  type: SecurityIncidentType;
  severity: SecuritySeverity;
  description?: string;
  occurredAt: string;
  status: IncidentStatus;
  responseNotes?: string;
}

// Computed, not stored - the core of the decision-support layer.
export interface InstitutionPriorityDTO {
  institutionId: string;
  institutionName: string;
  regionId?: string;
  score: number; // higher = more urgent
  reasons: string[]; // human-readable contributing factors
  openIncidentCount: number;
  criticalFacilityCount: number;
  activeInterventionCount: number;
}

export interface DashboardSummaryDTO {
  totalInstitutions: number;
  criticalPriorityCount: number;
  openSecurityIncidents: number;
  activeInterventions: number;
  facilitiesNeedingAttention: number;
}

export interface FacilityDTO {
  id: string;
  institutionId: string;
  category: FacilityCategory;
  condition: FacilityCondition;
  notes?: string;
  lastInspectedAt?: string;
}

export interface CreateFacilityDTO {
  institutionId: string;
  category: FacilityCategory;
  condition: FacilityCondition;
  notes?: string;
}

export interface EnrollmentRecordDTO {
  id: string;
  institutionId: string;
  term: string; // e.g. "2026-T1"
  studentCount: number;
  staffCount: number;
  maleCount?: number;
  femaleCount?: number;
  createdAt: string;
}
