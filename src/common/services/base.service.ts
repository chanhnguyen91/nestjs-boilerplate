import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, ILike } from 'typeorm';
import { getQueryParams } from '../utils/query.util';

export interface ICrudService<T> {
  create(entity: DeepPartial<T>): Promise<T>;
  findAll(paginationDto?: any, relations?: string[]): Promise<{ data: T[]; total: number }>;
  findOne(id: number, relations?: string[]): Promise<T>;
  update(id: number, entity: DeepPartial<T>): Promise<T>;
  remove(id: number): Promise<void>;
}

@Injectable()
export abstract class BaseService<T> implements ICrudService<T> {
  protected repository: Repository<T>;

  protected constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const newEntity = this.repository.create(entity);
    return await this.repository.save(newEntity);
  }

  async findAll(paginationDto?: any, relations: string[] = []): Promise<{ data: T[]; total: number }> {
    const allowedSortFields: string[] = [];
    const searchableFields: string[] = [];

    const queryParams = getQueryParams<T>(paginationDto, allowedSortFields, searchableFields);
    if (paginationDto?.keyword && searchableFields.length) {
      const keywordConditions = searchableFields.map(field => ({
        [field]: ILike(`%${paginationDto.keyword}%`),
      }));
      queryParams.where = [
        ...(Array.isArray(queryParams.where) ? queryParams.where : queryParams.where ? [queryParams.where] : []),
        ...keywordConditions,
      ] as any;
    }

    const queryBuilder = this.repository.createQueryBuilder('entity');
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    // Lặp qua order để áp dụng từng cặp key-value
    if (queryParams.order) {
      Object.entries(queryParams.order).forEach(([field, order]) => {
        queryBuilder.addOrderBy(`entity.${field}`, order as 'ASC' | 'DESC');
      });
    }

    const [data, total] = await queryBuilder
      .skip(queryParams.skip)
      .take(queryParams.take)
      .where(queryParams.where)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number, relations: string[] = []): Promise<T> {
    const queryBuilder = this.repository.createQueryBuilder('entity');
    relations.forEach(relation => {
      queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
    });

    const entity = await queryBuilder
      .where('entity.id = :id', { id })
      .getOne();

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, entity: DeepPartial<T>): Promise<T> {
    const existingEntity = await this.findOne(id);
    Object.assign(existingEntity, entity);
    return await this.repository.save(existingEntity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }
}