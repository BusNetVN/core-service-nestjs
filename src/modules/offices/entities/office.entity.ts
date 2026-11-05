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

@Entity('tbl_offices')
@Index('uq_offices_company_code', ['company_id', 'office_code'], {
  unique: true,
})
export class Office {
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
    foreignKeyConstraintName: 'fk_offices_company',
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
  office_code: string;

  @Column({ length: 180 })
  name: string;

  @Column({ type: 'text', default: '' })
  address: string;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  phones: string[];

  @Column({ type: 'text', default: '' })
  note: string;

  /** false when the office has stopped working; it is kept for history and assigned vehicles. */
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Username of the account that created the office, as it was at that time
   * (not a foreign key, so it survives renames and deletions); null for older rows.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the office. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
