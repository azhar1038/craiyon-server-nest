import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserIdInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization.split(' ');
    let userId: string | undefined = undefined;
    if (type === 'Bearer' && token) {
      userId = this.authService.verifyAccessToken(token);
    }

    request['userId'] = userId;
    return next.handle();
  }
}
