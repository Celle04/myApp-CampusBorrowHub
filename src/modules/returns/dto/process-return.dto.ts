import { IsOptional, IsString, IsArray, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessReturnDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  additionalCharges?: number;
}