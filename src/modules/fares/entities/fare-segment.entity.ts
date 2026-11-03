import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Point } from '../../points/entities/point.entity.js';
import { Fare } from './fare.entity.js';

@Entity('tbl_fare_segments')
@Index('uq_fare_segments_leg', ['fare_id', 'origin_point_id', 'destination_point_id'], {
  unique: true,
})
export class FareSegment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Index()
  @Column({ type: 'bigint' })
  fare_id: string;

  @ManyToOne(() => Fare, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({
    name: 'fare_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fare_segments_fare',
  })
  fare: Fare;

  @Column({ type: 'bigint' })
  origin_point_id: string;

  @ManyToOne(() => Point, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'origin_point_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fare_segments_origin',
  })
  origin_point: Point;

  @Column({ type: 'bigint' })
  destination_point_id: string;

  @ManyToOne(() => Point, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({
    name: 'destination_point_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'fk_fare_segments_destination',
  })
  destination_point: Point;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;
}
