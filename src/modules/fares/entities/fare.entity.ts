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
import { Route } from '../../routes/entities/route.entity.js';
import { Schedule } from '../../schedules/entities/schedule.entity.js';
import { SeatMap } from '../../seat-maps/entities/seat-map.entity.js';
import type { FareSegment } from './fare-segment.entity.js';

@Entity('tbl_fares')
export class Fare {
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
    foreignKeyConstraintName: 'fk_fares_company',
  })
  company: Company;

  @Index()
  @Column({ type: 'bigint' })
  route_id: string;

  @ManyToOne(() => Route, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'route_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fares_route',
  })
  route: Route;

  @Index()
  @Column({ type: 'bigint', nullable: true })
  schedule_id: string | null;

  @ManyToOne(() => Schedule, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({
    name: 'schedule_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fares_schedule',
  })
  schedule: Schedule | null;

  @Index()
  @Column({ type: 'bigint', nullable: true })
  seat_map_id: string | null;

  @ManyToOne(() => SeatMap, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({
    name: 'seat_map_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fares_seat_map',
  })
  seat_map: SeatMap | null;

  @Column({ type: 'boolean', default: false })
  priority: boolean;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  /** ISO weekdays: 1 = thứ 2 … 7 = chủ nhật. */
  @Column({
    type: 'smallint',
    array: true,
    default: () => 'ARRAY[1,2,3,4,5,6,7]',
  })
  weekdays: number[];

  segments?: FareSegment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
