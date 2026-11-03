import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { PointsModule } from '../points/points.module.js';
import { AdminRoutesController } from './controllers/admin-routes.controller.js';
import { RoutesController } from './controllers/routes.controller.js';
import { RoutePoint } from './entities/route-point.entity.js';
import { Route } from './entities/route.entity.js';
import { RouteRepository } from './repository/route.repository.js';
import { RoutePointRepository } from './repository/route-point.repository.js';
import { AdminCreateRouteUseCase } from './usecases/admin/admin-create-route.usecase.js';
import { AdminDeleteRouteUseCase } from './usecases/admin/admin-delete-route.usecase.js';
import { AdminFindAllRoutesUseCase } from './usecases/admin/admin-find-all-route.usecase.js';
import { AdminUpdateRouteUseCase } from './usecases/admin/admin-update-route.usecase.js';
import { CreateRouteUseCase } from './usecases/create-route.usecase.js';
import { FindAllRoutesUseCase } from './usecases/find-all-routes.usecase.js';
import { FindRoutePointsUseCase } from './usecases/find-route-points.usecase.js';
import { FindRouteUseCase } from './usecases/find-route.usecase.js';
import { RemoveRouteUseCase } from './usecases/remove-route.usecase.js';
import { ReorderRoutesUseCase } from './usecases/reorder-routes.usecase.js';
import { ReplaceRoutePointsUseCase } from './usecases/replace-route-points.usecase.js';
import { UpdateRouteUseCase } from './usecases/update-route.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route, RoutePoint, Company]),
    CompaniesModule,
    PointsModule,
  ],
  controllers: [RoutesController, AdminRoutesController],
  providers: [
    RouteRepository,
    AdminFindAllRoutesUseCase,
    AdminCreateRouteUseCase,
    AdminUpdateRouteUseCase,
    AdminDeleteRouteUseCase,
    RoutePointRepository,
    FindAllRoutesUseCase,
    FindRouteUseCase,
    FindRoutePointsUseCase,
    CreateRouteUseCase,
    UpdateRouteUseCase,
    RemoveRouteUseCase,
    ReorderRoutesUseCase,
    ReplaceRoutePointsUseCase,
  ],
  exports: [RouteRepository, RoutePointRepository],
})
export class RoutesModule {}
