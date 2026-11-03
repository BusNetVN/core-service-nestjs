import { Injectable } from '@nestjs/common';
import { FareRepository } from '../repository/fare.repository.js';

@Injectable()
export class RemoveFareUseCase {
  constructor(private readonly fares: FareRepository) {}

  async execute(uuid: string) {
    const fare = await this.fares.findByUuid(uuid);
    await this.fares.remove(fare);
    return { id: fare.uuid };
  }
}
