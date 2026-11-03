import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ProvinceTypeValue } from '../enums/location-type.enum.js';
import type { Ward } from './ward.entity.js';

@Entity('tbl_provinces')
export class Province {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index({ unique: true })
  @Column({ length: 8, unique: true })
  code: string;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 32 })
  type: ProvinceTypeValue;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany('Ward', 'province')
  wards: Ward[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
