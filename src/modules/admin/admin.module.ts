import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { Equipment } from '../../entities/equipment.entity';
import { BorrowRequest } from '../../entities/borrow-request.entity';
import { Return } from '../../entities/return.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Equipment, BorrowRequest, Return])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
