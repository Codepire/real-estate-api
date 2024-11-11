import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { v4 } from 'uuid';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse<Response>();

        // Check if the sessionId cookie exists
        if (!request.cookies['anonymusVisiter']) {
            const sessionId = v4();
            response.cookie('anonymusVisiter', sessionId, {
                httpOnly: true,
                secure: false, //todo: Set to true in production with HTTPS
                maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
            });

            request.cookies.anonymusVisiter = sessionId;
        }

        return next.handle();
    }
}
