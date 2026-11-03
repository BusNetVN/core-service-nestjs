import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { Route } from '../routes/entities/route.entity.js';
import { RoutesModule } from '../routes/routes.module.js';
import { SeatMap } from '../seat-maps/entities/seat-map.entity.js';
import { SeatMapsModule } from '../seat-maps/seat-maps.module.js';
import { SchedulesController } from './controllers/schedules.controller.js';
import { Schedule } from './entities/schedule.entity.js';
import { ScheduleRepository } from './repository/schedule.repository.js';
import { CreateScheduleUseCase } from './usecases/create-schedule.usecase.js';
import { FindAllSchedulesUseCase } from './usecases/find-all-schedules.usecase.js';
import { FindMatchingSchedulesUseCase } from './usecases/find-matching-schedules.usecase.js';
import { FindScheduleUseCase } from './usecases/find-schedule.usecase.js';
import { RemoveScheduleUseCase } from './usecases/remove-schedule.usecase.js';
import { UpdateScheduleUseCase } from './usecases/update-schedule.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, Route, SeatMap, Company]),
    CompaniesModule,
    RoutesModule,
    SeatMapsModule,
  ],
  controllers: [SchedulesController],
  providers: [
    ScheduleRepository,
    FindAllSchedulesUseCase,
    FindMatchingSchedulesUseCase,
    FindScheduleUseCase,
    CreateScheduleUseCase,
    UpdateScheduleUseCase,
    RemoveScheduleUseCase,
  ],
  exports: [ScheduleRepository],
})
export class SchedulesModule {}
