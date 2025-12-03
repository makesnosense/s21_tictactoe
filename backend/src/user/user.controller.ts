import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../auth/auth.controller';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ id: string; username: string }> {
    return await this.userService.findById(req.userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Request() req: AuthenticatedRequest): Promise<void> {
    await this.userService.deleteById(req.userId);
  }

  @Get(':userId')
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<{ id: string; username: string }> {
    return await this.userService.findById(userId);
  }
}
