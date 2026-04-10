import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowRequest, RequestStatus } from '../../entities/borrow-request.entity';
import { Equipment } from '../../entities/equipment.entity';
import { User } from '../../entities/user.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto, RejectRequestDto } from './dto/approve-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(BorrowRequest)
    private requestRepository: Repository<BorrowRequest>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userId: number, createRequestDto: CreateRequestDto): Promise<BorrowRequest> {
    const { equipmentId, requestedQuantity, startDate, endDate } = createRequestDto;

    // Check if equipment exists and is available
    const equipment = await this.equipmentRepository.findOne({ where: { id: equipmentId } });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    if (equipment.availableQuantity < requestedQuantity) {
      throw new BadRequestException('Insufficient equipment available');
    }

    // Check date validity
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end || start < new Date()) {
      throw new BadRequestException('Invalid date range');
    }

    const request = this.requestRepository.create({
      userId,
      equipmentId,
      requestedQuantity,
      startDate: start,
      endDate: end,
      notes: createRequestDto.notes,
    });

    return this.requestRepository.save(request);
  }

  async findAll(userId?: number): Promise<BorrowRequest[]> {
    const qb = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.equipment', 'equipment');

    if (userId) {
      qb.where('request.userId = :userId', { userId });
    }

    return qb.getMany();
  }

  async findOne(id: number, userId?: number): Promise<BorrowRequest> {
    const qb = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.equipment', 'equipment')
      .where('request.id = :id', { id });

    if (userId) {
      qb.andWhere('request.userId = :userId', { userId });
    }

    const request = await qb.getOne();
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  async update(id: number, userId: number, updateRequestDto: UpdateRequestDto): Promise<BorrowRequest> {
    const request = await this.findOne(id, userId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cannot update a request that is not pending');
    }

    Object.assign(request, updateRequestDto);
    return this.requestRepository.save(request);
  }

  async cancel(id: number, userId: number): Promise<BorrowRequest> {
    const request = await this.findOne(id, userId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cannot cancel a request that is not pending');
    }

    request.status = RequestStatus.CANCELLED;
    return this.requestRepository.save(request);
  }

  async approve(id: number, approverId: number, approveRequestDto: ApproveRequestDto): Promise<BorrowRequest> {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    // Check if equipment is still available
    const equipment = await this.equipmentRepository.findOne({ where: { id: request.equipmentId } });
    if (!equipment || equipment.availableQuantity < request.requestedQuantity) {
      throw new BadRequestException('Equipment no longer available');
    }

    // Update equipment availability
    equipment.availableQuantity -= request.requestedQuantity;
    await this.equipmentRepository.save(equipment);

    request.status = RequestStatus.APPROVED;
    request.approvedBy = approverId;
    request.approvedAt = new Date();
    if (approveRequestDto.notes) {
      request.notes = approveRequestDto.notes;
    }

    return this.requestRepository.save(request);
  }

  async reject(id: number, rejectRequestDto: RejectRequestDto): Promise<BorrowRequest> {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    request.status = RequestStatus.REJECTED;
    if (rejectRequestDto.reason) {
      request.rejectionReason = rejectRequestDto.reason;
    }
    if (rejectRequestDto.notes) {
      request.notes = rejectRequestDto.notes;
    }

    return this.requestRepository.save(request);
  }

  async findPending(): Promise<BorrowRequest[]> {
    return this.requestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['user', 'equipment'],
    });
  }
}