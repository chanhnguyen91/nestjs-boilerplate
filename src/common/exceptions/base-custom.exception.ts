import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export abstract class BaseCustomException extends HttpException {
  public readonly metadata: Partial<ApiResponse<null>>['error'];

  constructor(
    metadata: Partial<ApiResponse<null>>['error'],
    message: string,
    status: HttpStatus,
  ) {
    super(message, status);
    this.metadata = metadata;
  }
}