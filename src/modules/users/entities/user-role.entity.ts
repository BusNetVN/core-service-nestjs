import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity.js';
import { User } from './user.entity.js';

/** Roles (nhóm quyền) granted to an account; each role belongs to the account's company. */
@Entity('tbl_user_roles')
export class UserRole {
  @PrimaryColumn({ type: 'bigint' })
  user_id: string;

  @PrimaryColumn({ type: 'bigint' })
  @Index()
  role_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_roles_user',
  })
  user: Relation<User>;

  @ManyToOne(() => Role, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_user_roles_role',
  })
  role: Relation<Role>;

  @CreateDateColumn()
  created_at: Date;
}
