import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './domains/auth/auth.module';
import { UserModule } from './domains/user/user.module';
import { RoleModule } from './domains/role/role.module';
import { databaseConfig } from './config/database.config';
import { WinstonProvider } from './common/utils/logger.util';
import { ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { I18nService } from './common/services/i18n.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dataSourceOptions = databaseConfig;
        return dataSourceOptions;
      },
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource(new DataSource(options));
      }
    }),
    CacheModule.register({
      store: redisStore as any,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_PASSWORD,
      isGlobal: true,
      ttl: Number(process.env.CACHE_TTL_IN_SECOND) || 5,
      max: Number(process.env.CACHE_MAX_ITEM) || 100,
    }),
    AuthModule,
    UserModule,
    RoleModule,
  ],
  providers: [
    WinstonProvider,
    I18nService,
    {
      provide: 'APP_PIPE',
      useClass: ZodValidationPipe,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}