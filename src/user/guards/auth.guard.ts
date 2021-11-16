import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ExpressRequestInterface } from '../../types/expressRequest.interface';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<ExpressRequestInterface>();

    if (req.user) {
      return true;
    }

    throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
  }
}
