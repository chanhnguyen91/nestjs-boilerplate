import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';
import { BaseCustomException } from './base-custom.exception';

export class BusinessLogicError extends BaseCustomException {
  constructor(metadata: Partial<ApiResponse<null>>['error'], message?: string) {
    super(metadata, message || 'Business logic error', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}