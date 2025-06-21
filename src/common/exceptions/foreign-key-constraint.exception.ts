import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';
import { BaseCustomException } from './base-custom.exception';

export class ForeignKeyConstraintError extends BaseCustomException {
  constructor(metadata: Partial<ApiResponse<null>>['error'], message?: string) {
    super(metadata, message || 'Foreign key constraint violation', HttpStatus.BAD_REQUEST);
  }
}