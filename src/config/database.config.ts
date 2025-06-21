import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'local'}`),
});
dotenv.config({
  path: path.resolve(process.cwd(), `.env`),
  override: false
});

const buildDatabaseUrl = (): string => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_HOST_PORT, 10) || 3307;
  const username = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'password';
  const database = process.env.MYSQL_DATABASE || 'nest_db';

  return `mysql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
};

export const databaseConfig: DataSourceOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL || buildDatabaseUrl(),
  // host: process.env.MYSQL_HOST || 'localhost',
  // port: parseInt(process.env.MYSQL_HOST_PORT, 10) || 3306,
  // username: process.env.MYSQL_USER || 'root',
  // password: process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'password',
  // database: process.env.MYSQL_DATABASE || 'nest_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: true,//process.env.NODE_ENV === 'local',
  migrationsRun: false,
};

const AppDataSource = new DataSource(databaseConfig);
export default AppDataSource;