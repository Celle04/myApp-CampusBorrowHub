import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsObject, IsEnum } from 'class-validator';
import { EquipmentStatus } from '../../../entities/equipment.entity';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsNumber()
  @Min(1)
  totalQuantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  availableQuantity?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  specifications?: object;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;
}
