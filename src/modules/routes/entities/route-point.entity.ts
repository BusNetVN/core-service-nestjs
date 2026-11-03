import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Point } from '../../points/entities/point.entity.js';
import { Route } from './route.entity.js';

/** A point (điểm dừng) of a route, in travel order. Renamed from tbl_route_stops by migrate-route-point-table. */
@Entity('tbl_route_point')
@Index('uq_route_point_route_point', ['route_id', 'point_id'], { unique: true })
export class RoutePoint {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index()
  @Column({ type: 'bigint' })
  route_id: string;

  @ManyToOne(() => Route, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'route_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_route_point_route',
  })
  route: Route;

  @Index()
  @Column({ type: 'bigint' })
  point_id: string;

  @ManyToOne(() => Point, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'point_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_route_point_point',
  })
  point: Point;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'int', default: 0 })
  duration_minutes: number;
}
