import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config.js';
import jwtConfig from './config/jwt.config.js';
import { CommonModule } from './common/common.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { OfficesModule } from './modules/offices/offices.module.js';
import { RoutesModule } from './modules/routes/routes.module.js';
import { SeatMapsModule } from './modules/seat-maps/seat-maps.module.js';
import { SchedulesModule } from './modules/schedules/schedules.module.js';
import { LocationsModule } from './modules/locations/locations.module.js';
import { PointsModule } from './modules/points/points.module.js';
import { FaresModule } from './modules/fares/fares.module.js';
import { VehiclesModule } from './modules/vehicles/vehicles.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { RolesModule } from './modules/roles/roles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig],
    }),
    DatabaseModule,
    CommonModule,
    CompaniesModule,
    OfficesModule,
    RoutesModule,
    SeatMapsModule,
    SchedulesModule,
    PointsModule,
    LocationsModule,
    FaresModule,
    VehiclesModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
