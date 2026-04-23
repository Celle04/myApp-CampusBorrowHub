import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit(): Promise<void> {
    await this.ensureDefaultAdmin();
  }

  private async ensureDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      return;
    }

    const email = process.env.ADMIN_EMAIL || 'admin@borrowhub.local';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const existingUser = await this.userRepository.findOne({ where: { email } });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      existingUser.role = UserRole.ADMIN;
      existingUser.isActive = true;
      existingUser.password = hashedPassword;
      await this.userRepository.save(existingUser);
      this.logger.log(`Promoted existing user ${email} to ADMIN.`);
      return;
    }

    const adminUser = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepository.save(adminUser);
    this.logger.log(`Created default admin account for ${email}.`);
  }
}
