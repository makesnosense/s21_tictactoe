import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import { JwtRequestDto } from './dtos/jwt-request.dto';
import { JwtResponseDto } from './dtos/jwt-response.dto';
import { RefreshJwtRequestDto } from './dtos/refresh-jwt-request.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

export interface AccessAuthenticatedRequest extends ExpressRequest {
  user: { userId: string };
}

export interface RefreshAuthenticatedRequest extends ExpressRequest {
  user: { userId: string; jti: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: SignUpRequestDto): Promise<SignUpResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: JwtRequestDto): Promise<JwtResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Request() req: RefreshAuthenticatedRequest,
    @Body() _dto: RefreshJwtRequestDto, // required by task, validated by guard
  ): Promise<JwtResponseDto> {
    // passport has validated the refresh token and attached user to request
    return this.authService.refreshFromValidatedToken(
      req.user.userId,
      req.user.jti,
    );
  }
}
