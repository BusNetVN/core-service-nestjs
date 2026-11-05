import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity.js';

const SEARCH_COLUMNS = [
  'license_plate',
  'engine_number',
  'chassis_number',
  'brand',
  'owner_name',
] as const;
const RELATIONS = { company: true, office: true } as const;

/** Vehicle data access for /api/admin/vehicles. */
@Injectable()
export class AdminVehicleRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicles: Repository<Vehicle>,
  ) {}

  create(data: Partial<Vehicle>) {
    return this.vehicles.create(data);
  }

  save(vehicle: Vehicle) {
    return this.vehicles.save(vehicle);
  }

  merge(vehicle: Vehicle, fields: Partial<Vehicle>) {
    return this.vehicles.merge(vehicle, fields);
  }

  remove(vehicle: Vehicle) {
    return this.vehicles.remove(vehicle);
  }

  async findByUuid(uuid: string) {
    const vehicle = await this.vehicles.findOne({
      where: { uuid },
      relations: RELATIONS,
    });
    if (!vehicle) {
      throw new NotFoundException('Không tìm thấy phương tiện.');
    }
    return vehicle;
  }

  /** Vehicles of every company (or of one when `companyId` is set), by company then newest. */
  async findAll(options: { companyId?: string; query?: string }) {
    const keyword = options.query?.trim();
    const qb = this.vehicles
      .createQueryBuilder('vehicle')
      .innerJoinAndSelect('vehicle.company', 'company')
      .leftJoinAndSelect('vehicle.office', 'office');

    if (options.companyId) {
      qb.where('vehicle.company_id = :companyId', {
        companyId: options.companyId,
      });
    }

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(vehicle.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('company.name', 'ASC')
      .addOrderBy('vehicle.created_at', 'DESC')
      .getMany();
  }

  /** License plates are unique per company, compared case-insensitively. */
  async assertUniquePlate(
    companyId: string,
    licensePlate: string,
    excludeId?: string,
  ) {
    const qb = this.vehicles
      .createQueryBuilder('vehicle')
      .where('vehicle.company_id = :companyId', { companyId })
      .andWhere('UPPER(vehicle.license_plate) = :plate', {
        plate: licensePlate.trim().toUpperCase(),
      });
    if (excludeId) {
      qb.andWhere('vehicle.id != :excludeId', { excludeId });
    }

    if (await qb.getExists()) {
      throw new ConflictException('Biển số xe đã tồn tại.');
    }
  }
}
