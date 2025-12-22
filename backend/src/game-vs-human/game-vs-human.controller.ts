import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GameVsHumanService } from './game-vs-human.service';
import { AccessAuthenticatedRequest } from 'src/auth/auth.controller';
import { MakeMoveVsHumanDto } from './dtos/make-move-vs-human.dto';
import type { GameVsHuman } from '../../../shared/types/game-vs-human';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@Controller('games-vs-human')
@UseGuards(AccessTokenGuard)
export class GameVsHumanController {
  constructor(private readonly gameService: GameVsHumanService) {}

  @Post()
  async createGame(
    @Request() req: AccessAuthenticatedRequest,
  ): Promise<GameVsHuman> {
    return this.gameService.createGame(req.user.userId);
  }

  @Get('available')
  async getAvailableGames(): Promise<GameVsHuman[]> {
    return this.gameService.getAvailableGames();
  }

  @Get('my-active-game')
  async getMyActiveGame(
    @Request() req: AccessAuthenticatedRequest,
  ): Promise<GameVsHuman | null> {
    return this.gameService.getActiveGameByUserId(req.user.userId);
  }

  @Get('my-history')
  async getMyGameHistory(
    @Request() req: AccessAuthenticatedRequest,
  ): Promise<GameVsHuman[]> {
    return this.gameService.getCompletedGamesByUserId(req.user.userId);
  }

  @Post(':gameId/join')
  async joinGame(
    @Param('gameId') gameId: string,
    @Request() req: AccessAuthenticatedRequest,
  ): Promise<GameVsHuman> {
    return this.gameService.joinGame(gameId, req.user.userId);
  }

  @Post(':gameId/move')
  async makeMove(
    @Param('gameId') gameId: string,
    @Request() req: AccessAuthenticatedRequest,
    @Body() dto: MakeMoveVsHumanDto,
  ): Promise<GameVsHuman> {
    return this.gameService.makeMove(gameId, req.user.userId, dto.board);
  }

  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string): Promise<GameVsHuman> {
    return this.gameService.getGame(gameId);
  }
}
