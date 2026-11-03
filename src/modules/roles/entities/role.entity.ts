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
import { Permission } from '../../permissions/entities/permission.entity.js';

@Entity('tbl_roles')
export class Role {
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
    foreignKeyConstraintName: 'fk_roles_company',
  })
  company: Company;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** Rows of tbl_role_permissions are removed with the role or the permission (ON DELETE CASCADE). */
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'tbl_role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_role_permissions_role',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_role_permissions_permission',
    },
  })
  permissions: Permission[];

  /**
   * Username of the account that created the role, as it was at that time
   * (not a foreign key, so it survives renames and deletions).
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the role. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
