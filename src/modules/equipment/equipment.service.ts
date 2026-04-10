import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create({
      ...createEquipmentDto,
      availableQuantity: createEquipmentDto.totalQuantity,
    });
    return this.equipmentRepository.save(equipment);
  }

  async findAll(query?: any): Promise<Equipment[]> {
    const qb = this.equipmentRepository.createQueryBuilder('equipment');

    if (query.category) {
      qb.andWhere('equipment.category = :category', { category: query.category });
    }

    if (query.search) {
      qb.andWhere('(equipment.name LIKE :search OR equipment.description LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }
    return equipment;
  }

  async update(id: number, updateEquipmentDto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);

    // If total quantity is being updated, adjust available quantity accordingly
    if (updateEquipmentDto.totalQuantity !== undefined) {
      const difference = updateEquipmentDto.totalQuantity - equipment.totalQuantity;
      updateEquipmentDto.availableQuantity = equipment.availableQuantity + difference;
    }

    Object.assign(equipment, updateEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: number): Promise<void> {
    const equipment = await this.findOne(id);
    await this.equipmentRepository.remove(equipment);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.equipmentRepository
      .createQueryBuilder('equipment')
      .select('DISTINCT equipment.category', 'category')
      .getRawMany();

    return result.map(item => item.category);
  }
}