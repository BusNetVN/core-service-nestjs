import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity.js';
import { Province } from '../../locations/entities/province.entity.js';
import { Ward } from '../../locations/entities/ward.entity.js';
import { PointScope, type PointScopeValue } from '../enums/point-scope.enum.js';
import type { PointTypeValue } from '../enums/point-type.enum.js';

@Entity('tbl_points')
@Index('idx_points_company_code', ['company_id', 'point_code'])
export class Point {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'bigint', nullable: true })
  company_id: string | null;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({
    name: 'company_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_points_company',
  })
  company: Company | null;

  @Index()
  @Column({
    type: 'varchar',
    length: 16,
    default: PointScope.SYSTEM,
  })
  scope: PointScopeValue;

  @Column({
    length: 32,
    transformer: {
      to: (value: unknown) =>
        typeof value === 'string' ? value.trim().toUpperCase() : value,
      from: (value: unknown) =>
        typeof value === 'string' ? value.toUpperCase() : value,
    },
  })
  point_code: string;

  @Column({ length: 180 })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 32, default: '' })
  point_type: PointTypeValue | '';

  @Index()
  @Column({ type: 'bigint', nullable: true })
  province_id: string | null;

  @ManyToOne(() => Province, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({
    name: 'province_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_points_province',
  })
  province: Province | null;

  @Index()
  @Column({ type: 'bigint', nullable: true })
  ward_id: string | null;

  @ManyToOne(() => Ward, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({
    name: 'ward_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_points_ward',
  })
  ward: Ward | null;

  @Column({ type: 'text', default: '' })
  address: string;

  @Column({ type: 'text', default: '' })
  note: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @ManyToMany(() => Company)
  @JoinTable({
    name: 'tbl_point_allowed_companies',
    joinColumn: {
      name: 'point_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_point_allowed_companies_point',
    },
    inverseJoinColumn: {
      name: 'company_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_point_allowed_companies_company',
    },
  })
  allowed_companies: Company[];

  /**
   * Username of the account that created the point, as it was at that time
   * (not a foreign key, so it survives renames and deletions); null for older rows.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the point. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
