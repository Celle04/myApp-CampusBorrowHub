import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Return } from '../../entities/return.entity';
import { BorrowRequest, RequestStatus } from '../../entities/borrow-request.entity';
import { Equipment } from '../../entities/equipment.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessReturnDto } from './dto/process-return.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private returnRepository: Repository<Return>,
    @InjectRepository(BorrowRequest)
    private requestRepository: Repository<BorrowRequest>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async create(userId: number, createReturnDto: CreateReturnDto): Promise<Return> {
    const { borrowRequestId, returnedQuantity } = createReturnDto;

    // Check if request exists and belongs to user
    const request = await this.requestRepository.findOne({
      where: { id: borrowRequestId, userId },
      relations: ['equipment'],
    });

    if (!request) {
      throw new NotFoundException('Borrow request not found');
    }

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestException('Cannot return equipment for unapproved request');
    }

    // Check if return already exists
    const existingReturn = await this.returnRepository.findOne({
      where: { borrowRequestId },
    });

    if (existingReturn) {
      throw new BadRequestException('Return already submitted for this request');
    }

    const quantity = returnedQuantity || request.requestedQuantity;

    const returnEntity = this.returnRepository.create({
      borrowRequestId,
      returnedQuantity: quantity,
      returnDate: new Date(),
      condition: createReturnDto.condition,
      damageDescription: createReturnDto.damageDescription,
      damagePhotos: createReturnDto.damagePhotos,
      charges: createReturnDto.charges,
      notes: createReturnDto.notes,
    });

    return this.returnRepository.save(returnEntity);
  }

  async findAll(userId?: number): Promise<Return[]> {
    const qb = this.returnRepository.createQueryBuilder('return')
      .leftJoinAndSelect('return.borrowRequest', 'borrowRequest')
      .leftJoinAndSelect('borrowRequest.equipment', 'equipment')
      .leftJoinAndSelect('borrowRequest.user', 'user')
      .leftJoinAndSelect('return.processor', 'processor');

    if (userId) {
      qb.where('borrowRequest.userId = :userId', { userId });
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Return> {
    const returnEntity = await this.returnRepository.findOne({
      where: { id },
      relations: ['borrowRequest', 'borrowRequest.equipment', 'borrowRequest.user', 'processor'],
    });

    if (!returnEntity) {
      throw new NotFoundException('Return not found');
    }

    return returnEntity;
  }

  async processReturn(id: number, processorId: number, processReturnDto: ProcessReturnDto): Promise<Return> {
    const returnEntity = await this.findOne(id);

    if (returnEntity.processedBy) {
      throw new BadRequestException('Return already processed');
    }

    // Update equipment availability
    const equipment = returnEntity.borrowRequest.equipment;
    equipment.availableQuantity += returnEntity.returnedQuantity;
    await this.equipmentRepository.save(equipment);

    // Update request status
    returnEntity.borrowRequest.status = RequestStatus.COMPLETED;
    await this.requestRepository.save(returnEntity.borrowRequest);

    // Process the return
    returnEntity.processedBy = processorId;
    returnEntity.charges = (returnEntity.charges || 0) + (processReturnDto.additionalCharges || 0);
    if (processReturnDto.notes) {
      returnEntity.notes = processReturnDto.notes;
    }

    return this.returnRepository.save(returnEntity);
  }

  async findPending(): Promise<Return[]> {
    return this.returnRepository.find({
      where: { processedBy: IsNull() },
      relations: ['borrowRequest', 'borrowRequest.equipment', 'borrowRequest.user'],
    });
  }
}