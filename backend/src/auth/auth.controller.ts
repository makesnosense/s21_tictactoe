import { Controller, Post, Body, Headers } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import { JwtRequestDto } from './dtos/jwt-request.dto';
import { JwtResponseDto } from './dtos/jwt-response.dto';
import { RefreshJwtRequestDto } from './dtos/refresh-jwt-request.dto';

export interface AuthenticatedRequest extends ExpressRequest {
  userId: string;
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
  async refresh(@Body() dto: RefreshJwtRequestDto): Promise<JwtResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }
}
