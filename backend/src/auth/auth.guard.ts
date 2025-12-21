import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';
import { AuthenticatedRequest } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: ExpressRequest = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    const refreshToken = authHeader.slice('Bearer '.length);

    try {
      const extractedPayload: { sub: string; jti: string } =
        this.jwtService.verify(refreshToken, {
          secret: ACCESS_TOKEN_SECRET,
        });

      (request as AuthenticatedRequest).userId = extractedPayload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
