import { IsOptional, IsString } from 'class-validator';

export class ApproveRequestDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}