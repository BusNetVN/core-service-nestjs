import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './controllers/locations.controller.js';
import { Province } from './entities/province.entity.js';
import { Ward } from './entities/ward.entity.js';
import { ProvinceRepository } from './repository/province.repository.js';
import { WardRepository } from './repository/ward.repository.js';
import { FindAllProvincesUseCase } from './usecases/find-all-provinces.usecase.js';
import { FindAllWardsUseCase } from './usecases/find-all-wards.usecase.js';
import { ImportLocationsUseCase } from './usecases/import-locations.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([Province, Ward])],
  controllers: [LocationsController],
  providers: [
    ProvinceRepository,
    WardRepository,
    FindAllProvincesUseCase,
    FindAllWardsUseCase,
    ImportLocationsUseCase,
  ],
  exports: [ProvinceRepository, WardRepository],
})
export class LocationsModule {}
