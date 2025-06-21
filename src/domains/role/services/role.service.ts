import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dtos';
import { BaseService } from '../../../common/services/base.service';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { I18nService } from '../../../common/services/i18n.service';
import { NotFoundError } from '../../../common/exceptions/not-found.exception';
import { ConflictError } from '../../../common/exceptions/conflict.exception';
import { ValidationError } from '../../../common/exceptions/validation.exception';
import { PaginationDto } from '../../../common/dtos';

@Injectable()
export class RoleService extends BaseService<RoleEntity> {
  protected repository: Repository<RoleEntity>;
  protected allowedSortFields = ['id', 'name'];
  protected searchableFields = ['name'];

  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
    @Inject('winston') private readonly logger: Logger,
    private i18nService: I18nService
  ) {
    super(repository);
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const existingRole = await this.repository.findOne({ where: { name: createRoleDto.name } });
    if (existingRole) {
      throw new ConflictError({
        statusCode: HttpStatus.CONFLICT,
        message: this.i18nService.translate('errors.duplicate_role'),
        details: [{ path: 'name', message: `Role name ${createRoleDto.name} already exists` }],
      });
    }

    if (!createRoleDto.name || createRoleDto.name.trim().length === 0) {
      throw new ValidationError({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18nService.translate('errors.invalid_role_name'),
        details: [{ path: 'name', message: 'Role name must not be empty' }],
      });
    }

    const role = this.repository.create(createRoleDto);
    const savedRole = await this.repository.save(role);
    this.logger.info(`Role created with ID: ${savedRole.id}`);
    return savedRole;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: RoleEntity[]; total: number }> {
    return super.findAll(paginationDto, ['rolePermissions']);
  }

  async findOne(id: number): Promise<RoleEntity> {
    const role = await super.findOne(id, ['rolePermissions']);
    if (!role) {
      throw new NotFoundError({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.translate('errors.not_found'),
        details: [{ path: 'id', message: `Role with ID ${id} not found` }],
      });
    }
    this.logger.info(`Retrieved role with ID: ${id}`);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await super.findOne(id, ['rolePermissions']);
    Object.assign(role, updateRoleDto as DeepPartial<RoleEntity>);
    const updatedRole = await this.repository.save(role);
    this.logger.info(`Updated role with ID: ${id}`);
    return updatedRole;
  }

  async remove(id: number): Promise<void> {
    const role = await super.findOne(id, ['rolePermissions']);
    await this.repository.remove(role);
    this.logger.info(`Deleted role with ID: ${id}`);
  }
}