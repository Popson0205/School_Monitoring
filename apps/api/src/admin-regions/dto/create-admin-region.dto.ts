import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateAdminRegionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  level: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
