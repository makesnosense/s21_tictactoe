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
import { AccessAuthenticatedRequest } from '../auth/auth.controller';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('users')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(
    @Request() req: AccessAuthenticatedRequest,
  ): Promise<{ id: string; username: string }> {
    return await this.userService.findByIdPublic(req.user.userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Request() req: AccessAuthenticatedRequest): Promise<void> {
    await this.userService.deleteById(req.user.userId);
  }

  @Get(':userId')
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<{ id: string; username: string }> {
    return await this.userService.findByIdPublic(userId);
  }
}
