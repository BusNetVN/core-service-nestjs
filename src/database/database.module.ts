import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import pg from 'pg';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { migrateCompanyAuditUsername } from './migrate-company-audit-username.js';
import { migrateCompanyIsActive } from './migrate-company-is-active.js';
import { migrateOfficeCompanyFk } from './migrate-office-company-fk.js';
import { migratePermissionAudit } from './migrate-permission-audit.js';
import { migrateUserAudit } from './migrate-user-audit.js';
import { migrateUserCompanyFk } from './migrate-user-company-fk.js';
import { migratePointAllowedCompanies } from './migrate-point-allowed-companies.js';
import { migratePointIsActive } from './migrate-point-is-active.js';
import { migratePointScope } from './migrate-point-scope.js';
import { migratePointType } from './migrate-point-type.js';
import { migrateRoutePointTable } from './migrate-route-point-table.js';
import { migrateSeatMapIsActive } from './migrate-seat-map-is-active.js';

// "timestamp without time zone" columns hold UTC wall-clock times (they default to now()
// on a UTC server, and Spring/EF wrote UTC too). pg would otherwise read them as the
// Node process's local time, shifting every created_at/updated_at by the UTC offset.
pg.types.setTypeParser(
  pg.types.builtins.TIMESTAMP,
  (value) => new Date(`${value.replace(' ', 'T')}Z`),
);

function isLocalHost(host: string) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('-db')
  );
}

function sslOption(host: string, sslMode?: string) {
  const mode = (sslMode ?? (isLocalHost(host) ? 'disable' : 'require')).toLowerCase();
  if (mode === 'disable' || mode === 'false') {
    return false;
  }

  return { rejectUnauthorized: mode !== 'no-verify' };
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const synchronize =
          (configService.get<string>('DATABASE_SYNC') ?? 'true') !== 'false';
        const sslMode = configService.get<string>('DB_SSL');
        const url = configService.get<string>('DATABASE_URL');

        if (url) {
          const withSsl =
            url.includes('sslmode=') || sslMode === 'disable'
              ? url
              : `${url}${url.includes('?') ? '&' : '?'}sslmode=require`;

          return {
            type: 'postgres' as const,
            url: withSsl,
            ssl: sslOption('remote', sslMode ?? 'require'),
            autoLoadEntities: true,
            synchronize,
          };
        }

        const host = configService.get<string>('DB_HOST') ?? '127.0.0.1';
        const ssl = sslOption(host, sslMode);

        return {
          type: 'postgres' as const,
          host,
          port: Number(configService.get<string>('DB_PORT') ?? 5432),
          username: configService.get<string>('DB_USERNAME') ?? 'postgres',
          password: configService.get<string>('DB_PASSWORD') ?? '',
          database: configService.get<string>('DB_NAME') ?? 'bnv_core',
          ssl,
          extra: ssl ? { ssl } : undefined,
          autoLoadEntities: true,
          synchronize,
        };
      },
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('TypeORM options are required.');
        }

        const synchronize = Boolean(options.synchronize);
        const dataSource = new DataSource({
          ...options,
          synchronize: false,
        } as DataSourceOptions);
        await dataSource.initialize();
        await migrateCompanyIsActive(dataSource);
        await migrateCompanyAuditUsername(dataSource);
        await migratePermissionAudit(dataSource);
        await migrateUserAudit(dataSource);
        await migrateOfficeCompanyFk(dataSource);
        await migratePointScope(dataSource);
        await migratePointType(dataSource);
        await migrateRoutePointTable(dataSource);
        await migrateSeatMapIsActive(dataSource);
        await migratePointIsActive(dataSource);
        if (synchronize) {
          await dataSource.synchronize();
        }
        await migratePointAllowedCompanies(dataSource);
        await migrateUserCompanyFk(dataSource);
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
