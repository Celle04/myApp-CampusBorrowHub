import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BorrowRequest } from './borrow-request.entity';
import { User } from './user.entity';

export enum EquipmentCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

@Entity('returns')
export class Return {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  borrowRequestId: number;

  @ManyToOne(() => BorrowRequest)
  @JoinColumn({ name: 'borrowRequestId' })
  borrowRequest: BorrowRequest;

  @Column({ default: 1 })
  returnedQuantity: number;

  @Column({ type: 'datetime' })
  returnDate: Date;

  @Column({
    type: 'varchar',
    default: EquipmentCondition.GOOD,
  })
  condition: EquipmentCondition;

  @Column({ type: 'text', nullable: true })
  damageDescription: string;

  @Column({ type: 'json', nullable: true })
  damagePhotos: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  charges: number;

  @Column({ nullable: true })
  processedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processedBy' })
  processor: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
