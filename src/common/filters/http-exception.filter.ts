import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';
import { I18nService } from '../services/i18n.service';
import { BaseCustomException } from '../exceptions/base-custom.exception';
import { z } from 'zod';

type ZodIssueWithReceived = z.ZodIssue & {
  received?: string;
  validation?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly i18nService: I18nService
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const lang = request.headers['accept-language']?.includes('vi') ? 'vi' : 'en';
    console.log('Request language:', lang);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: { message: string; details?: any } = { message: 'Internal Server Error' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseData = exception.getResponse();

      if (exception instanceof BaseCustomException) {
        const errorKey = this.getErrorKey(status);
        errorResponse = {
          message: this.i18nService.translate(`errors.${errorKey}`, {}, lang),
          details: exception.metadata.details
            ? exception.metadata.details.map((detail: { path?: string; message: string | { key: string; params: any } }) => ({
                path: detail.path,
                message: typeof detail.message === 'string'
                  ? this.i18nService.translate(detail.message, {}, lang)
                  : this.i18nService.translate(detail.message.key, detail.message.params || {}, lang),
              }))
            : [
                {
                  message: this.i18nService.translate(exception.metadata.message, {}, lang),
                },
              ],
        };
      } else if (
        typeof responseData === 'object' &&
        responseData !== null &&
        'message' in responseData &&
        responseData.message === 'Validation failed' &&
        'errors' in responseData &&
        Array.isArray(responseData.errors)
      ) {
        const errors = (responseData.errors as ZodIssueWithReceived[]).map((e: ZodIssueWithReceived) => {
          const params = { field: e.path[0] };
          let errorCode = e.code;

          if (errorCode === 'invalid_type' && e.received === 'undefined') {
            errorCode = 'custom';
          }
          if (errorCode === 'invalid_string' && e.validation === 'email') {
            errorCode = 'custom';
            return {
              path: e.path.join('.'),
              message: this.i18nService.translate(e.message, params, lang),
            };
          }

          const mappedKey = this.i18nService.mapZodErrorToKey(errorCode);
          const translatedMessage = this.i18nService.translate(mappedKey, params, lang);
          return {
            path: e.path.join('.'),
            message: translatedMessage || e.message,
          };
        });
        errorResponse = {
          message: this.i18nService.translate('errors.validation', {}, lang),
          details: errors,
        };
      } else if (exception instanceof UnauthorizedException) {
        errorResponse = {
          message: this.i18nService.translate('errors.http_401', {}, lang),
          details: [
            {
              message: this.i18nService.translate('errors.unauthorized', {}, lang),
            },
          ],
        };
      } else if (typeof responseData === 'object' && responseData !== null) {
        errorResponse = {
          message: this.i18nService.translate(`errors.http_${status}`, {}, lang),
          details: 'error' in responseData && responseData.error && typeof responseData.error === 'object' && 'message' in responseData.error
            ? [{ message: this.i18nService.translate(String(responseData.error.message), {}, lang) }]
            : 'details' in responseData
              ? responseData.details
              : 'message' in responseData
                ? [{ message: this.i18nService.translate(String(responseData.message), {}, lang) }]
                : null,
        };
      } else if (typeof responseData === 'string') {
        errorResponse = {
          message: this.i18nService.translate(`errors.http_${status}`, {}, lang),
          details: [
            {
              message: this.i18nService.translate(responseData, {}, lang),
            },
          ],
        };
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        message: this.i18nService.translate('errors.internal_server_error', {}, lang),
      };
      this.logger.error(`[${request.method}] ${request.url} - ${status}: ${exception.message}`, exception.stack);
    }

    const message = errorResponse.message;
    this.logger.error(`[${request.method}] ${request.url} - ${status}: ${JSON.stringify(errorResponse)}`);

    const apiResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        statusCode: status,
        message,
        details: errorResponse.details,
      },
    };

    response.status(status).json(apiResponse);
  }

  private getErrorKey(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'not_found';
      case HttpStatus.CONFLICT:
        return 'conflict';
      case HttpStatus.BAD_REQUEST:
        return 'validation';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'unprocessable_entity';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'service_unavailable';
      default:
        return 'internal_server_error';
    }
  }
}