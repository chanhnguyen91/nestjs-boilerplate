import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => this.logger.info(`${method} ${url} - ${Date.now() - now}ms`)),
      );
  }
}
