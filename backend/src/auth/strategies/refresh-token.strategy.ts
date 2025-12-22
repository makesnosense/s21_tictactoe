import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { REFRESH_TOKEN_SECRET } from '../auth.service';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prisma: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: REFRESH_TOKEN_SECRET,
    });
  }

  async validate(payload: {
    sub: string;
    jti: string;
  }): Promise<{ userId: string; jti: string }> {
    // Passport has already verified the JWT signature and expiration
    // now we only need to check if the JTI exists in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    return { userId: payload.sub, jti: payload.jti };
  }
}
