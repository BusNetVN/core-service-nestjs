import { BadRequestException, Injectable } from '@nestjs/common';
import {
  fetchOpenApiDivisions,
  shouldFetchRemote,
} from '../data/fetch-open-api.js';
import { Province } from '../entities/province.entity.js';
import { Ward } from '../entities/ward.entity.js';
import { ProvinceRepository } from '../repository/province.repository.js';
import { WardRepository } from '../repository/ward.repository.js';
import { normalizeLocationPayload } from '../utils/normalize-location.js';

const CHUNK_SIZE = 400;

@Injectable()
export class ImportLocationsUseCase {
  constructor(
    private readonly provinces: ProvinceRepository,
    private readonly wards: WardRepository,
  ) {}

  async execute(raw: unknown) {
    const payload = normalizeLocationPayload(
      shouldFetchRemote(raw) ? await fetchOpenApiDivisions() : raw,
    );
    if (!payload.provinces.length) {
      throw new BadRequestException('Không có tỉnh/thành phố để import.');
    }

    const provinceStats = await this.upsertProvinces(payload.provinces);
    const wardStats = await this.upsertWards(payload.wards);

    return {
      provinces: provinceStats,
      wards: wardStats,
    };
  }

  private async upsertProvinces(
    items: Array<{ code: string; name: string; type: Province['type'] }>,
  ) {
    const existed = await this.provinces.findByCodes(items.map((item) => item.code));
    const byCode = new Map(existed.map((item) => [item.code, item]));
    const rows: Province[] = [];
    let created = 0;
    let updated = 0;

    for (const item of items) {
      const current = byCode.get(item.code);
      if (current) {
        current.name = item.name;
        current.type = item.type;
        current.status = true;
        rows.push(current);
        updated += 1;
      } else {
        rows.push(
          this.provinces.create({
            uuid: crypto.randomUUID(),
            code: item.code,
            name: item.name,
            type: item.type,
            status: true,
          }),
        );
        created += 1;
      }
    }

    await this.saveChunks(rows, (chunk) => this.provinces.saveMany(chunk));
    return { created, updated, total: rows.length };
  }

  private async upsertWards(
    items: Array<{
      code: string;
      name: string;
      type: Ward['type'];
      province_code: string;
    }>,
  ) {
    const provinceCodes = [...new Set(items.map((item) => item.province_code))];
    const provinces = await this.provinces.findByCodes(provinceCodes);
    const provinceByCode = new Map(provinces.map((item) => [item.code, item]));
    const existed = await this.wards.findByCodes(items.map((item) => item.code));
    const byCode = new Map(existed.map((item) => [item.code, item]));
    const rows: Ward[] = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      const province = provinceByCode.get(item.province_code);
      if (!province) {
        skipped += 1;
        continue;
      }

      const current = byCode.get(item.code);
      if (current) {
        current.name = item.name;
        current.type = item.type;
        current.province_id = province.id;
        current.status = true;
        rows.push(current);
        updated += 1;
      } else {
        rows.push(
          this.wards.create({
            uuid: crypto.randomUUID(),
            province_id: province.id,
            code: item.code,
            name: item.name,
            type: item.type,
            status: true,
          }),
        );
        created += 1;
      }
    }

    await this.saveChunks(rows, (chunk) => this.wards.saveMany(chunk));
    return { created, updated, skipped, total: items.length };
  }

  private async saveChunks<T>(
    rows: T[],
    save: (chunk: T[]) => Promise<unknown>,
  ) {
    for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
      await save(rows.slice(index, index + CHUNK_SIZE));
    }
  }
}
