import { Injectable } from '@nestjs/common';
import { toPublicFare } from '../mappers/fare.mapper.js';
import { FareRepository } from '../repository/fare.repository.js';

@Injectable()
export class FindFareUseCase {
  constructor(private readonly fares: FareRepository) {}

  async execute(uuid: string) {
    return toPublicFare(await this.fares.findByUuid(uuid));
  }
}
