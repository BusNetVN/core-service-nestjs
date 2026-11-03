import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Ward } from '../entities/ward.entity.js';

@Injectable()
export class WardRepository {
  constructor(
    @InjectRepository(Ward)
    private readonly wards: Repository<Ward>,
  ) {}

  create(data: Partial<Ward>) {
    return this.wards.create(data);
  }

  save(ward: Ward) {
    return this.wards.save(ward);
  }

  saveMany(wards: Ward[]) {
    return this.wards.save(wards);
  }

  async findByUuid(uuid: string) {
    const ward = await this.wards.findOne({
      where: { uuid },
      relations: { province: true },
    });
    if (!ward) {
      throw new NotFoundException('Không tìm thấy xã/phường.');
    }
    return ward;
  }

  findByCodes(codes: string[]) {
    if (!codes.length) {
      return Promise.resolve([]);
    }
    return this.wards
      .createQueryBuilder('ward')
      .where('ward.code IN (:...codes)', { codes })
      .getMany();
  }

  findVisible(options: { provinceId?: string; query?: string }) {
    const keyword = options.query?.trim();
    const qb = this.wards
      .createQueryBuilder('ward')
      .leftJoinAndSelect('ward.province', 'province');

    if (options.provinceId) {
      qb.andWhere('ward.province_id = :provinceId', {
        provinceId: options.provinceId,
      });
    }

    if (keyword) {
      qb.andWhere(
        '(LOWER(ward.name) LIKE :q OR LOWER(ward.code) LIKE :q)',
        { q: `%${keyword.toLowerCase()}%` },
      );
    }

    return qb.orderBy('ward.name', 'ASC').getMany();
  }
}
