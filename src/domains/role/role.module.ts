import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { RoleEntity, PermissionEntity, RolePermissionEntity } from './entities';
import { WinstonProvider } from '../../common/utils/logger.util';
import { I18nService } from '../../common/services/i18n.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity, RolePermissionEntity])],
  controllers: [RoleController],
  providers: [RoleService, WinstonProvider, I18nService],
  exports: [RoleService],
})
export class RoleModule {}
