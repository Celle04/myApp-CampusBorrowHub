import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ default: 1 })
  totalQuantity: number;

  @Column({ default: 1 })
  availableQuantity: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  specifications: object;

  @Column({ default: 'Main Campus' })
  location: string;

  @Column({
    type: 'varchar',
    default: EquipmentStatus.AVAILABLE,
  })
  status: EquipmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}