import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Equipment } from '../../entities/equipment.entity';
import { BorrowRequest, RequestStatus } from '../../entities/borrow-request.entity';
import { Return } from '../../entities/return.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(BorrowRequest)
    private readonly requestRepository: Repository<BorrowRequest>,
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,
  ) {}

  async getUsers(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map(({ password: _password, ...user }) => user);
  }

  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = updateUserRoleDto.role;
    if (typeof updateUserRoleDto.isActive === 'boolean') {
      user.isActive = updateUserRoleDto.isActive;
    }

    const savedUser = await this.userRepository.save(user);
    const { password: _password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  async getOverviewReport() {
    const [
      totalUsers,
      totalEquipment,
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      totalReturns,
      pendingReturns,
      activeUsers,
      equipment,
      recentRequests,
      recentReturns,
      recentUsers,
      roleCountsRaw,
    ] = await Promise.all([
      this.userRepository.count(),
      this.equipmentRepository.count(),
      this.requestRepository.count(),
      this.requestRepository.count({ where: { status: RequestStatus.PENDING } }),
      this.requestRepository.count({ where: { status: RequestStatus.APPROVED } }),
      this.requestRepository.count({ where: { status: RequestStatus.COMPLETED } }),
      this.returnRepository.count(),
      this.returnRepository.count({ where: { processedBy: IsNull() } }),
      this.userRepository.count({ where: { isActive: true } }),
      this.equipmentRepository.find({ order: { updatedAt: 'DESC' } }),
      this.requestRepository.find({
        relations: ['user', 'equipment'],
        order: { createdAt: 'DESC' },
        take: 8,
      }),
      this.returnRepository.find({
        relations: ['borrowRequest', 'borrowRequest.user', 'borrowRequest.equipment', 'processor'],
        order: { createdAt: 'DESC' },
        take: 8,
      }),
      this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 8,
      }),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.role')
        .getRawMany(),
    ]);

    const totalAvailableUnits = equipment.reduce((sum, item) => sum + item.availableQuantity, 0);
    const totalUnits = equipment.reduce((sum, item) => sum + item.totalQuantity, 0);
    const lowStockItems = equipment
      .filter((item) => item.availableQuantity <= Math.max(1, Math.floor(item.totalQuantity * 0.25)))
      .slice(0, 8);

    const roleCounts = {
      [UserRole.ADMIN]: 0,
      [UserRole.STAFF]: 0,
      [UserRole.STUDENT]: 0,
    };

    for (const row of roleCountsRaw) {
      roleCounts[row.role as UserRole] = Number(row.count);
    }

    return {
      summary: {
        totalUsers,
        activeUsers,
        totalEquipment,
        totalUnits,
        totalAvailableUnits,
        totalRequests,
        pendingRequests,
        approvedRequests,
        completedRequests,
        totalReturns,
        pendingReturns,
      },
      roleCounts,
      lowStockItems,
      recentRequests,
      recentReturns,
      recentUsers: recentUsers.map(({ password: _password, ...user }) => user),
    };
  }
}
