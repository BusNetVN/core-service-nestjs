import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity.js';

// Created by the EF Core migrations; TypeORM must not alter it.
@Entity({ name: 'tbl_permission_groups', synchronize: false })
export class PermissionGroup {
  @PrimaryGeneratedColumn('identity', {
    type: 'bigint',
    generatedIdentity: 'BY DEFAULT',
  })
  id: string;

  @Column({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  sort_order: number;

  @Column({ type: 'boolean' })
  is_active: boolean;

  /**
   * Username of the account that created the group, as it was at that time
   * (not a foreign key); null for older rows. Added by migrate-permission-audit.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the group. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Permission, (permission) => permission.group)
  permissions: Permission[];
}
