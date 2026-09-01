import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;

  @IsString()
  @IsNotEmpty()
  term: string;

  @IsInt()
  @Min(0)
  studentCount: number;

  @IsInt()
  @Min(0)
  staffCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maleCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  femaleCount?: number;
}
