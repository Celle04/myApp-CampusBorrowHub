import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Request() req, @Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.create(req.user.id, createReturnDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.returnsService.findAll(req.user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  findPending() {
    return this.returnsService.findPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnsService.findOne(+id);
  }

  @Put(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  processReturn(@Param('id') id: string, @Request() req, @Body() processReturnDto: ProcessReturnDto) {
    return this.returnsService.processReturn(+id, req.user.id, processReturnDto);
  }
}