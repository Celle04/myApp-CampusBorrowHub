import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString, IsArray, IsDecimal } from 'class-validator';
import { EquipmentCondition } from '../../../entities/return.entity';
import { Type } from 'class-transformer';

export class CreateReturnDto {
  @IsNumber()
  borrowRequestId: number;

  @IsNumber()
  @IsOptional()
  returnedQuantity?: number;

  @IsEnum(EquipmentCondition)
  condition: EquipmentCondition;

  @IsString()
  @IsOptional()
  damageDescription?: string;

  @IsArray()
  @IsOptional()
  damagePhotos?: string[];

  @Type(() => Number)
  @IsOptional()
  charges?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}