import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dtos';
import { BaseService } from '../../../common/services/base.service';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { I18nService } from '../../../common/services/i18n.service';
import { NotFoundError, ConflictError, ValidationError } from '../../../common/exceptions';
import { PaginationDto } from '../../../common/dtos';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  protected repository: Repository<UserEntity>;
  protected allowedSortFields = ['id', 'email', 'name'];
  protected searchableFields = ['email', 'name'];

  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
    @Inject('winston') private readonly logger: Logger,
    private i18nService: I18nService
  ) {
    super(repository);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.repository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictError({
        statusCode: HttpStatus.CONFLICT,
        message: this.i18nService.translate('errors.duplicate_email'),
        details: [{ path: 'email', message: `Email ${createUserDto.email} already exists` }],
      });
    }

    if (!createUserDto.email || !createUserDto.email.includes('@')) {
      throw new ValidationError({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18nService.translate('errors.invalid_email'),
        details: [{ path: 'email', message: 'Email must be valid' }],
      });
    }

    const user = this.repository.create(createUserDto as DeepPartial<UserEntity>);
    const savedUser = await this.repository.save(user);
    this.logger.info(`User created with ID: ${savedUser.id}`);
    return savedUser;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: UserEntity[]; total: number }> {
    return super.findAll(paginationDto, ['roles']);
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await super.findOne(id, ['roles']);
    if (!user) {
      throw new NotFoundError({
        statusCode: HttpStatus.NOT_FOUND,
        message: this.i18nService.translate('errors.not_found'),
        details: [{ path: 'id', message: `User with ID ${id} not found` }],
      });
    }
    this.logger.info(`Retrieved user with ID: ${id}`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await super.findOne(id, ['roles']);
    Object.assign(user, updateUserDto as DeepPartial<UserEntity>);
    const updatedUser = await this.repository.save(user);
    this.logger.info(`Updated user with ID: ${id}`);
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await super.findOne(id, ['roles']);
    await this.repository.remove(user);
    this.logger.info(`Deleted user with ID: ${id}`);
  }
}