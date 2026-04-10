import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Return } from '../../entities/return.entity';
import { BorrowRequest } from '../../entities/borrow-request.entity';
import { Equipment } from '../../entities/equipment.entity';
import { ReturnsService } from './returns.service';
import { ReturnsController } from './returns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Return, BorrowRequest, Equipment])],
  controllers: [ReturnsController],
  providers: [ReturnsService],
})
export class ReturnsModule {}
