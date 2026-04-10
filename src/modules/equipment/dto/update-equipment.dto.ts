import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipmentDto } from './create-equipment.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableQuantity?: number;
}