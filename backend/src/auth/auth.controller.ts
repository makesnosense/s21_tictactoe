import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

export interface AuthenticatedRequest extends ExpressRequest {
  userId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    return this.authService.register(signUpDto);
  }

  @Post('login')
  async login(
    @Headers('authorization') authHeader: string,
  ): Promise<LoginResponseDto> {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const base64Credentials = authHeader.slice('Basic '.length);
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );

    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw new UnauthorizedException('Invalid credentials format');
    }

    return this.authService.login(username, password);
  }
}
