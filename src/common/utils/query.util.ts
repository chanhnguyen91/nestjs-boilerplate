import { BadRequestException } from '@nestjs/common';
import { FindOptionsWhere, FindOptionsOrder, ILike } from 'typeorm';

export interface QueryParams<T> {
  skip?: number;
  take?: number;
  where?: FindOptionsWhere<T>;
  order?: FindOptionsOrder<T>;
}

export function getQueryParams<T>(
  paginationDto: any,
  allowedSortFields: string[] = [],
  searchableFields: string[] = []
): QueryParams<T> {
  const { page = 1, limit = 10, keyword, sort, filter } = paginationDto;

  const params: QueryParams<T> = {
    skip: (page - 1) * limit,
    take: limit,
  };

  // Handle keyword search
  if (keyword && searchableFields.length) {
    const keywordConditions = searchableFields.map(field => ({
      [field]: ILike(`%${keyword}%`),
    }));
    params.where = [
      ...(Array.isArray(params.where) ? params.where : params.where ? [params.where] : []),
      ...keywordConditions,
    ] as any;
  }

  // Handle filter
  if (filter) {
    try {
      const filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
      params.where = [
        ...(Array.isArray(params.where) ? params.where : params.where ? [params.where] : []),
        filterObj,
      ] as any;
    } catch (e) {
      throw new BadRequestException('Invalid filter format. Expected JSON object.');
    }
  }

  // Handle sort
  if (sort) {
    const sortArray = sort.split(',').map(s => s.trim()).filter(s => s);
    if (sortArray.length) {
      const order: FindOptionsOrder<T> = {};
      sortArray.forEach(sortStr => {
        const isDescending = sortStr.startsWith('-');
        const field = isDescending ? sortStr.slice(1) : sortStr;
        if (allowedSortFields.length && !allowedSortFields.includes(field)) {
          throw new BadRequestException(`Sort field '${field}' is not allowed.`);
        }
        order[field] = isDescending ? 'DESC' : 'ASC';
      });
      params.order = order;
    }
  }

  return params;
}