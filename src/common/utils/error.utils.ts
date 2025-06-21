import { HttpStatus } from '@nestjs/common';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  AccessDeniedError,
  BusinessLogicError,
  DatabaseConnectionError,
  ForeignKeyConstraintError,
  BaseCustomException,
} from '../exceptions';
import { I18nErrorDetail, I18nErrorMetadata } from '../exceptions/custom-exception.interface';
import { ApiResponse } from '../interfaces/api-response.interface';

function createI18nErrorDetail(
  messageKey: string | { key: string; params?: Record<string, any> },
  path?: string,
  args?: Record<string, any>
): I18nErrorDetail {
  if (typeof messageKey === 'object' && messageKey !== null && 'key' in messageKey) {
    return { path, message: messageKey };
  } else {
    return { path, message: messageKey, args };
  }
}

function buildAndThrowError<T extends BaseCustomException>(
  ExceptionClass: new (metadata: I18nErrorMetadata, message?: string) => T,
  statusCode: HttpStatus,
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): T {
  const details: I18nErrorDetail[] = [];
  if (detailSpecs) {
    for (const spec of detailSpecs) {
      if (typeof spec === 'string') {
        details.push(createI18nErrorDetail(spec));
      } else if (typeof spec === 'object' && spec !== null) {
        details.push(createI18nErrorDetail({ key: spec.key, params: spec.params }, spec.path));
      }
    }
  }

  const metadata: I18nErrorMetadata = {
    statusCode,
    message: mainMessageKey,
    args: mainMessageArgs,
    details: details.length > 0 ? details : undefined,
  };

  return new ExceptionClass(metadata);
}

function buildDatabaseConnectionErrorInstance(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): DatabaseConnectionError {
  const details: I18nErrorDetail[] = [];
  if (detailSpecs) {
    for (const spec of detailSpecs) {
      if (typeof spec === 'string') {
        details.push(createI18nErrorDetail(spec));
      } else if (typeof spec === 'object' && spec !== null) {
        details.push(createI18nErrorDetail({ key: spec.key, params: spec.params }, spec.path));
      }
    }
  }

  const metadata: Partial<ApiResponse<null>>['error'] = {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    message: mainMessageKey,
    details: details.length > 0 ? details : undefined,
  };

  return new DatabaseConnectionError(metadata, mainMessageKey);
}

export function conflict(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): ConflictError {
  return buildAndThrowError(
    ConflictError,
    HttpStatus.CONFLICT,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function unauthorized(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): UnauthorizedError {
  return buildAndThrowError(
    UnauthorizedError,
    HttpStatus.UNAUTHORIZED,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function notFound(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): NotFoundError {
  return buildAndThrowError(
    NotFoundError,
    HttpStatus.NOT_FOUND,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function accessDenied(
  mainMessageKey: string,
  httpStatus: HttpStatus = HttpStatus.FORBIDDEN,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): AccessDeniedError {
  return buildAndThrowError(
    AccessDeniedError,
    httpStatus,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function businessLogicError(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): BusinessLogicError {
  return buildAndThrowError(
    BusinessLogicError,
    HttpStatus.UNPROCESSABLE_ENTITY,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function databaseConnectionError(
  mainMessageKey: string = 'errors.database_connection_failed',
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): DatabaseConnectionError {
  return buildDatabaseConnectionErrorInstance(
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}

export function foreignKeyConstraintError(
  mainMessageKey: string,
  mainMessageArgs?: Record<string, any>,
  detailSpecs?: Array<string | { key: string; params?: Record<string, any>; path?: string }>
): ForeignKeyConstraintError {
  return buildAndThrowError(
    ForeignKeyConstraintError,
    HttpStatus.BAD_REQUEST,
    mainMessageKey,
    mainMessageArgs,
    detailSpecs
  );
}