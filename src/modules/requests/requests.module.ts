import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRequest } from '../../entities/borrow-request.entity';
import { Equipment } from '../../entities/equipment.entity';
import { User } from '../../entities/user.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRequest, Equipment, User])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
