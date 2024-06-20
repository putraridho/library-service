/* eslint-disable @typescript-eslint/no-unsafe-member-access -- allow it */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    console.log(
      [
        `[${String(context.getArgByIndex(0)?.method)}]`,
        String(context.getArgByIndex(0)?.url),
      ].join(' ~ '),
    );
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.log(`After... ${String(Date.now() - now)}ms`);
      }),
    );
  }
}
