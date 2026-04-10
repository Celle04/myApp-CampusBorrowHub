import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto, RejectRequestDto } from './dto/approve-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, createRequestDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.requestsService.findAll(req.user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findPending() {
    return this.requestsService.findPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.requestsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(+id, req.user.id, updateRequestDto);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.requestsService.cancel(+id, req.user.id);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  approve(@Param('id') id: string, @Request() req, @Body() approveRequestDto: ApproveRequestDto) {
    return this.requestsService.approve(+id, req.user.id, approveRequestDto);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  reject(@Param('id') id: string, @Body() rejectRequestDto: RejectRequestDto) {
    return this.requestsService.reject(+id, rejectRequestDto);
  }
}