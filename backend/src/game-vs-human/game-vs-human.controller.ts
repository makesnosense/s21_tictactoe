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
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthenticatedRequest } from 'src/auth/auth.controller';
import { MakeMoveVsHumanDto } from './dtos/make-move-vs-human.dto';
import type { GameVsHuman } from '../../../shared/types/game-vs-human';

@Controller('games-vs-human')
@UseGuards(AuthGuard)
export class GameVsHumanController {
  constructor(private readonly gameService: GameVsHumanService) {}

  @Post()
  async createGame(@Request() req: AuthenticatedRequest): Promise<GameVsHuman> {
    return this.gameService.createGame(req.userId);
  }

  @Get('available')
  async getAvailableGames(): Promise<GameVsHuman[]> {
    return this.gameService.getAvailableGames();
  }

  @Get('my-active-game')
  async getMyActiveGame(
    @Request() req: AuthenticatedRequest,
  ): Promise<GameVsHuman | null> {
    return this.gameService.getActiveGameByUserId(req.userId);
  }

  @Post(':gameId/join')
  async joinGame(
    @Param('gameId') gameId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GameVsHuman> {
    return this.gameService.joinGame(gameId, req.userId);
  }

  @Post(':gameId/move')
  async makeMove(
    @Param('gameId') gameId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: MakeMoveVsHumanDto,
  ): Promise<GameVsHuman> {
    return this.gameService.makeMove(gameId, req.userId, dto.board);
  }

  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string): Promise<GameVsHuman> {
    return this.gameService.getGame(gameId);
  }
}
