import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Province } from '../entities/province.entity.js';

@Injectable()
export class ProvinceRepository {
  constructor(
    @InjectRepository(Province)
    private readonly provinces: Repository<Province>,
  ) {}

  create(data: Partial<Province>) {
    return this.provinces.create(data);
  }

  save(province: Province) {
    return this.provinces.save(province);
  }

  saveMany(provinces: Province[]) {
    return this.provinces.save(provinces);
  }

  findAll(query?: string) {
    const keyword = query?.trim();
    return this.provinces.find({
      where: keyword
        ? [{ name: ILike(`%${keyword}%`) }, { code: ILike(`%${keyword}%`) }]
        : undefined,
      order: { name: 'ASC' },
    });
  }

  findByCodes(codes: string[]) {
    if (!codes.length) {
      return Promise.resolve([]);
    }
    return this.provinces
      .createQueryBuilder('province')
      .where('province.code IN (:...codes)', { codes })
      .getMany();
  }

  async findByUuid(uuid: string) {
    const province = await this.provinces.findOne({ where: { uuid } });
    if (!province) {
      throw new NotFoundException('Không tìm thấy tỉnh/thành phố.');
    }
    return province;
  }
}
