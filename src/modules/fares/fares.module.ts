import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { Point } from '../points/entities/point.entity.js';
import { Route } from '../routes/entities/route.entity.js';
import { RoutesModule } from '../routes/routes.module.js';
import { Schedule } from '../schedules/entities/schedule.entity.js';
import { SchedulesModule } from '../schedules/schedules.module.js';
import { SeatMap } from '../seat-maps/entities/seat-map.entity.js';
import { SeatMapsModule } from '../seat-maps/seat-maps.module.js';
import { FaresController } from './controllers/fares.controller.js';
import { FareSegment } from './entities/fare-segment.entity.js';
import { Fare } from './entities/fare.entity.js';
import { FareRepository } from './repository/fare.repository.js';
import { CreateFareUseCase } from './usecases/create-fare.usecase.js';
import { FindAllFaresUseCase } from './usecases/find-all-fares.usecase.js';
import { FindFareUseCase } from './usecases/find-fare.usecase.js';
import { RemoveFareUseCase } from './usecases/remove-fare.usecase.js';
import { UpdateFareUseCase } from './usecases/update-fare.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fare,
      FareSegment,
      Company,
      Route,
      Schedule,
      SeatMap,
      Point,
    ]),
    CompaniesModule,
    RoutesModule,
    SchedulesModule,
    SeatMapsModule,
  ],
  controllers: [FaresController],
  providers: [
    FareRepository,
    FindAllFaresUseCase,
    FindFareUseCase,
    CreateFareUseCase,
    UpdateFareUseCase,
    RemoveFareUseCase,
  ],
})
export class FaresModule {}
