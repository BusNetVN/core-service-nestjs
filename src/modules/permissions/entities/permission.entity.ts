import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { PermissionGroup } from './permission-group.entity.js';

// Created by the EF Core migrations; TypeORM must not alter it.
@Entity({ name: 'tbl_permissions', synchronize: false })
export class Permission {
  @PrimaryGeneratedColumn('identity', {
    type: 'bigint',
    generatedIdentity: 'BY DEFAULT',
  })
  id: string;

  @Column({ type: 'uuid' })
  uuid: string;

  @Column({ type: 'bigint' })
  group_id: string;

  @ManyToOne(() => PermissionGroup, (group) => group.permissions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_permissions_group',
  })
  group: Relation<PermissionGroup>;

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
   * Username of the account that created the permission, as it was at that time
   * (not a foreign key); null for older rows. Added by migrate-permission-audit.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  created_by: string | null;

  /** Username of the account that last updated the permission. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz' })
  updated_at: Date;
}
