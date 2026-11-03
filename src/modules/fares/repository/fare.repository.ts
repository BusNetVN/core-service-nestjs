import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FareSegment } from '../entities/fare-segment.entity.js';
import { Fare } from '../entities/fare.entity.js';

const FARE_RELATIONS = {
  company: true,
  route: true,
  schedule: true,
  seat_map: true,
} as const;

@Injectable()
export class FareRepository {
  constructor(
    @InjectRepository(Fare)
    private readonly fares: Repository<Fare>,
    @InjectRepository(FareSegment)
    private readonly segments: Repository<FareSegment>,
  ) {}

  create(data: Partial<Fare>) {
    return this.fares.create(data);
  }

  async save(fare: Fare, segments: Array<Partial<FareSegment>>) {
    const saved = await this.fares.manager.transaction(async (manager) => {
      const stored = await manager.save(fare);
      await manager.delete(FareSegment, { fare_id: stored.id });
      if (segments.length > 0) {
        await manager.save(
          FareSegment,
          segments.map((segment) =>
            manager.create(FareSegment, { ...segment, fare_id: stored.id }),
          ),
        );
      }
      return stored;
    });
    return this.findByUuid(saved.uuid);
  }

  async remove(fare: Fare) {
    await this.fares.remove(fare);
  }

  async findByUuid(uuid: string) {
    const fare = await this.fares.findOne({
      where: { uuid },
      relations: FARE_RELATIONS,
    });
    if (!fare) {
      throw new NotFoundException('Không tìm thấy cấu hình giá vé.');
    }
    await this.attachSegments([fare]);
    return fare;
  }

  async findAll(companyId: string) {
    const fares = await this.fares.find({
      where: { company_id: companyId },
      relations: FARE_RELATIONS,
      order: { start_date: 'DESC', created_at: 'DESC' },
    });
    await this.attachSegments(fares);
    return fares;
  }

  private async attachSegments(fares: Fare[]) {
    if (fares.length === 0) {
      return;
    }
    const segments = await this.segments.find({
      where: { fare_id: In(fares.map((fare) => fare.id)) },
      relations: { origin_point: true, destination_point: true },
      order: { sort_order: 'ASC' },
    });
    const grouped = new Map<string, FareSegment[]>();
    for (const segment of segments) {
      const current = grouped.get(segment.fare_id) ?? [];
      current.push(segment);
      grouped.set(segment.fare_id, current);
    }
    for (const fare of fares) {
      fare.segments = grouped.get(fare.id) ?? [];
    }
  }
}
