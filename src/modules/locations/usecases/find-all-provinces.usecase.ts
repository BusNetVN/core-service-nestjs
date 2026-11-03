import { Injectable } from '@nestjs/common';
import { toPublicProvince } from '../mappers/location.mapper.js';
import { ProvinceRepository } from '../repository/province.repository.js';

@Injectable()
export class FindAllProvincesUseCase {
  constructor(private readonly provinces: ProvinceRepository) {}

  async execute(query?: string) {
    return (await this.provinces.findAll(query)).map(toPublicProvince);
  }
}
