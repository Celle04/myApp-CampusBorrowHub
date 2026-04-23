import { IsNotEmpty, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsNumber()
  equipmentId: number;

  @IsNumber()
  @Min(1)
  requestedQuantity: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
