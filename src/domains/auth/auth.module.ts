import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonProvider } from '../../common/utils/logger.util';
import { I18nService } from '../../common/services/i18n.service';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { UserService } from '../user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, RoleEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
    RoleModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, WinstonProvider, I18nService, UserService],
  exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule {}
