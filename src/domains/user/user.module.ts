import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { WinstonProvider } from '../../common/utils/logger.util';
import { I18nService } from '../../common/services/i18n.service';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, WinstonProvider, I18nService],
  exports: [UserService],
})
export class UserModule {}
