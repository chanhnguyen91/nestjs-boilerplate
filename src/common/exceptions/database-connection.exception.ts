import { ServiceUnavailableException } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export class DatabaseConnectionError extends ServiceUnavailableException {
  public readonly metadata: Partial<ApiResponse<null>>['error'];

  constructor(metadata: Partial<ApiResponse<null>>['error'], message?: string) {
    super(message || 'Database connection failed');
    this.metadata = metadata;
  }
}