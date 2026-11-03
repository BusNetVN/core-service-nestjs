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
import { Company } from '../../companies/entities/company.entity.js';

@Entity('tbl_routes')
@Index('uq_routes_company_code', ['company_id', 'route_code'], { unique: true })
export class Route {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'bigint' })
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'company_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_routes_company',
  })
  company: Company;

  @Column({
    length: 32,
    transformer: {
      to: (value: unknown) =>
        typeof value === 'string' ? value.trim().toUpperCase() : value,
      from: (value: unknown) =>
        typeof value === 'string' ? value.toUpperCase() : value,
    },
  })
  route_code: string;

  @Column({ length: 180 })
  name: string;

  @Column({ length: 180 })
  origin: string;

  @Column({ length: 180 })
  destination: string;

  @Column({ type: 'int', nullable: true })
  distance_km: number | null;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'text', default: '' })
  note: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  /**
   * Username of the account that created the route, as it was at that time
   * (not a foreign key, so it survives renames and deletions); null for older rows.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the route. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
