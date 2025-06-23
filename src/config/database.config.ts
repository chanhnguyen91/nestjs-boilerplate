import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export const databaseConfigFactory = (configService: ConfigService): DataSourceOptions => {
  const buildDatabaseUrl = (): string => {
    const host = configService.get<string>('MYSQL_HOST', 'localhost');
    const port = configService.get<number>('MYSQL_HOST_PORT', 3306);
    const username = configService.get<string>('MYSQL_USER', 'root');
    const password = configService.get<string>('MYSQL_PASSWORD', '');
    const database = configService.get<string>('MYSQL_DATABASE', 'nest_db');

    return `mysql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  };

  return {
    type: 'mysql',
    url: configService.get<string>('DATABASE_URL') || buildDatabaseUrl(),
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '..', 'migrations', '*.ts')],
    synchronize: false, //configService.get<string>('NODE_ENV') === 'local',
    migrationsRun: false,
    logging: configService.get<string>('NODE_ENV') === 'local',
  };
};

export const AppDataSource = new DataSource(databaseConfigFactory({
  get: (key: string, defaultValue?: any) => process.env[key] || defaultValue,
} as ConfigService));