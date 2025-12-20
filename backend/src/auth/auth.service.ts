import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtRequestDto } from './dtos/jwt-request.dto';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';

import { DatabaseService } from 'src/database/database.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import type { JwtResponseDto } from './dtos/jwt-response.dto';

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || 'access-secret-change-me';
const REFRESH_TOKEN_SECRET =
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

  async refresh(existingRefreshToken: string): Promise<JwtResponseDto> {
    let extractedPayload: { sub: string; jti: string };
    try {
      extractedPayload = this.jwtService.verify(existingRefreshToken, {
        secret: REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenRecordInDb = await this.prisma.refreshToken.findUnique({
      where: { jti: extractedPayload.jti },
    });

    if (!tokenRecordInDb || tokenRecordInDb.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // invalidate existing refresh token (delete by jti)
    await this.prisma.refreshToken.delete({
      where: { jti: extractedPayload.jti },
    });

    return this.generateTokens(extractedPayload.sub);
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.userService.deleteById(userId);
  }

  async getUserById(
    userId: string,
  ): Promise<{ id: string; username: string } | null> {
    const user = await this.userService.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  }
}
