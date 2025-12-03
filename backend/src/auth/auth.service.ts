import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpRequestDto } from './dtos/signup.dto';
import { SignUpResponseDto } from './dtos/signup-response.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(dto: SignUpRequestDto): Promise<SignUpResponseDto> {
    await this.userService.create(dto.login, dto.password);
    return { success: true };
  }

  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { userId: user.id };
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
