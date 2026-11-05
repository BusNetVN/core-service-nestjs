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
import { Office } from '../../offices/entities/office.entity.js';
import { VehicleCondition, VehicleStatus } from '../enums/vehicle.enum.js';

const numberTransformer = {
  to: (value: unknown) => value,
  from: (value: unknown) =>
    value === null || value === undefined ? value : Number(value),
};

@Entity('tbl_vehicles')
@Index('uq_vehicles_company_plate', ['company_id', 'license_plate'], {
  unique: true,
})
export class Vehicle {
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
    foreignKeyConstraintName: 'fk_vehicles_company',
  })
  company: Company;

  @Column({ length: 32 })
  license_plate: string;

  @Column({ length: 64, default: '' })
  engine_number: string;

  @Column({ length: 64, default: '' })
  chassis_number: string;

  @Column({ type: 'int', default: 0 })
  seat_count: number;

  @Column({ length: 64, default: '' })
  model_code: string;

  @Column({ length: 64, default: '' })
  vehicle_kind: string;

  @Column({ length: 64, default: '' })
  color: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numberTransformer,
  })
  payload: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 1,
    default: 0,
    transformer: numberTransformer,
  })
  initial_odometer: number;

  @Column({ length: 64, default: '' })
  brand: string;

  @Column({ type: 'int', nullable: true })
  manufacture_year: number | null;

  @Column({ length: 64, default: '' })
  manufacture_country: string;

  @Column({ type: 'int', nullable: true })
  service_life_year: number | null;

  @Column({ length: 180, default: '' })
  owner_name: string;

  @Column({ type: 'date', nullable: true })
  registration_date: string | null;

  @Column({ type: 'bigint', nullable: true })
  office_id: string | null;

  @ManyToOne(() => Office, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({
    name: 'office_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_vehicles_office',
  })
  office: Office | null;

  @Column({ type: 'varchar', length: 32, default: VehicleCondition.New })
  condition: VehicleCondition;

  @Column({ type: 'varchar', length: 32, default: VehicleStatus.InUse })
  status: VehicleStatus;

  /**
   * Username of the account that created the vehicle, as it was at that time
   * (not a foreign key, so it survives renames and deletions); null for older rows.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the vehicle. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
