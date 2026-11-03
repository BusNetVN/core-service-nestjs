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
import { SeatMap } from '../../seat-maps/entities/seat-map.entity.js';
import { WeekdayMode } from '../enums/weekday-mode.enum.js';

@Entity('tbl_schedules')
export class Schedule {
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
    foreignKeyConstraintName: 'fk_schedules_company',
  })
  company: Company;

  @Index()
  @Column({ type: 'bigint' })
  route_id: string;

  @ManyToOne(() => Route, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'route_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_schedules_route',
  })
  route: Route;

  @Index()
  @Column({ type: 'bigint' })
  seat_map_id: string;

  @ManyToOne(() => SeatMap, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'seat_map_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_schedules_seat_map',
  })
  seat_map: SeatMap;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'time', default: '00:00:00' })
  departure_time: string;

  @Column({
    type: 'varchar',
    length: 16,
    default: WeekdayMode.All,
  })
  weekday_mode: WeekdayMode;

  @Column({
    type: 'int',
    array: true,
    default: () => "'{1,2,3,4,5,6,7}'",
  })
  weekdays: number[];

  @Column({ type: 'text', default: '' })
  note: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
