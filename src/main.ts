import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module.js';
import {
  API_GLOBAL_PREFIX,
  API_GLOBAL_PREFIX_EXCLUDE,
  CORS_ALLOWED_HEADERS,
} from './common/constants/http.constant.js';
import { requestContext } from './common/http/api-response.js';
import { gatewayOnly } from './common/middleware/gateway-only.middleware.js';

type AppConfig = {
  port: number;
  corsOrigins: string[];
  gatewayToken: string;
};

async function pingDatabase(dataSource: DataSource) {
  const [row] = (await dataSource.query(`
    SELECT
      current_database() AS database,
      inet_server_port() AS port,
      NOW() AS connected_at
  `)) as Array<{ database: string; port: number; connected_at: string }>;

  return row;
}

function watchDatabaseDisconnect(dataSource: DataSource) {
  const pool = (
    dataSource.driver as {
      master?: { on?: (event: string, listener: (error: Error) => void) => void };
    }
  ).master;

  pool?.on?.('error', (error) => {
    console.error('Database connection lost');
    console.error(error.message);
  });
}

async function logDatabaseConnection(dataSource: DataSource) {
  const options = dataSource.options as {
    host?: string;
    port?: number;
    database?: string;
  };
  const target = `${options.host ?? 'localhost'}:${options.port ?? 5432}/${options.database ?? ''}`;

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const live = await pingDatabase(dataSource);
    watchDatabaseDisconnect(dataSource);
    console.log(
      `Database connection succeeded: ${target} (live ${live.database}:${live.port} at ${live.connected_at})`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Database connection failed: ${target}`);
    console.error(message);
    throw error;
  }
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const appConfig = configService.getOrThrow<AppConfig>('app');

    await logDatabaseConnection(app.get(DataSource));

    app.setGlobalPrefix(API_GLOBAL_PREFIX, { exclude: API_GLOBAL_PREFIX_EXCLUDE });
    app.use(requestContext());
    app.use(gatewayOnly(appConfig.gatewayToken));
    app.enableCors({
      origin: appConfig.corsOrigins,
      allowedHeaders: [...CORS_ALLOWED_HEADERS],
    });

    await app.listen(appConfig.port, '0.0.0.0');
    console.log(`core-service listening on http://localhost:${appConfig.port}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('core-service failed to start');
    console.error(message);
    process.exit(1);
  }
}
await bootstrap();
