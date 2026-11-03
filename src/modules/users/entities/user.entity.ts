import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type {
  AccountTypeValue,
  StaffRoleValue,
} from '../../../common/constants/account.constant.js';
import { Company } from '../../companies/entities/company.entity.js';

// Created by the EF Core migrations; TypeORM must not alter it.
@Entity({ name: 'tbl_users', synchronize: false })
export class User {
  @PrimaryGeneratedColumn('identity', {
    type: 'bigint',
    generatedIdentity: 'BY DEFAULT',
  })
  id: string;

  @Column({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash: string | null;

  @Column({ type: 'varchar', length: 32 })
  account_type: AccountTypeValue;

  @Column({ type: 'varchar', length: 32, nullable: true })
  staff_role: StaffRoleValue | null;

  /** false means the account is locked (or soft-deleted). */
  @Column({ type: 'boolean', default: true })
  status: boolean;

  /**
   * Username of the account that created this user, as it was at that time
   * (not a foreign key); null for older rows. Added by migrate-user-audit.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated (or soft-deleted) this user. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone_number: string | null;

  /**
   * Company the account belongs to (COMPANY_STAFF / AGENCY), null otherwise. The column and
   * fk_users_company are created by migrate-user-company-fk. Not loaded unless requested.
   */
  @ManyToOne(() => Company, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'company_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_users_company',
  })
  company: Relation<Company> | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}
