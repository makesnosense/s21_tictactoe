import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtRequestDto } from './dtos/jwt-request.dto';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

import { DatabaseService } from 'src/database/database.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import type { JwtResponseDto } from './dtos/jwt-response.dto';

export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || 'access-secret-change-me';
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '14d';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: DatabaseService,
  ) {}

  async register(dto: SignUpRequestDto): Promise<SignUpResponseDto> {
    await this.userService.create(dto.login, dto.password);
    return { success: true };
  }

  async login(dto: JwtRequestDto): Promise<JwtResponseDto> {
    const user = await this.userService.findByUsername(dto.login);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.userService.validatePassword(
      dto.password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  private async generateTokens(userId: string): Promise<JwtResponseDto> {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { secret: ACCESS_TOKEN_SECRET, expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const jti = crypto.randomUUID(); // generate jti for refresh token
    const refreshToken = this.jwtService.sign(
      { sub: userId, jti },
      { secret: REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    const expiresAt = new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY));

    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId,
        expiresAt,
      },
    });

    return {
      type: 'Bearer',
      accessToken,
      refreshToken,
    };
  }

  async refreshFromValidatedToken(
    userId: string,
    jti: string,
  ): Promise<JwtResponseDto> {
    // strategy has already validated the token and checked database
    // we just need to invalidate old token and generate new ones
    await this.prisma.refreshToken.delete({
      where: { jti },
    });
    return this.generateTokens(userId);
  }
}
