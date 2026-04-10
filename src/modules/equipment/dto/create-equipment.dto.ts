import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsObject } from 'class-validator';

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

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  specifications?: object;

  @IsString()
  @IsOptional()
  location?: string;
}