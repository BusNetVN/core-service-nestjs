import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { WardTypeValue } from '../enums/location-type.enum.js';
import { Province } from './province.entity.js';

@Entity('tbl_wards')
export class Ward {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'bigint' })
  province_id: string;

  @ManyToOne(() => Province, (province) => province.wards, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({
    name: 'province_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_wards_province',
  })
  province: Province;

  @Index({ unique: true })
  @Column({ length: 16, unique: true })
  code: string;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 32 })
  type: WardTypeValue;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
