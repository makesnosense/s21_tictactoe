import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Get,
  Delete,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import { GameServiceBase } from 'src/domain/services/game.service.interface';
import { GameRepository } from 'src/datasource/repositories/game.repository';
import { GameMapper } from '../mappers/game.mapper';
import { CELL } from 'src/domain/models/board.model';

import { createEmptyBoard } from '../../../../shared/types/board';

import type { GameDto } from '../models/game.dto';
import type { UUID } from 'crypto';
import { Game } from 'src/domain/models/game.model';

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameServiceBase,
    private readonly gameRepository: GameRepository,
  ) {}

  @Post()
  async createNewGame(): Promise<GameDto> {
    const newGame: Game = {
      id: randomUUID(),
      board: createEmptyBoard(),
      isGameOver: false,
      winner: null,
    };

    await this.gameRepository.save(newGame);

    return GameMapper.toDto(newGame);
  }

  @Post(':id')
  async makeMove(
    @Param('id') id: UUID,
    @Body() gameDto: GameDto,
  ): Promise<GameDto> {
    const game = GameMapper.toDomain(gameDto);

    const isValid = await this.gameService.validateBoard(game);
    if (!isValid) {
      throw new HttpException(
        'Invalid game state or move',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if game is already over before computer move
    const gameStatus = this.gameService.checkGameOver(game);
    if (gameStatus.isOver) {
      game.isGameOver = true;
      game.winner = gameStatus.winner;
      await this.gameRepository.save(game);
      return GameMapper.toDto(game);
    }

    const computerMove = this.gameService.calculateNextComputerMove(game);
    game.board[computerMove.row][computerMove.col] = CELL.COMPUTER;

    // check if game is over AFTER computer move
    const finalStatus = this.gameService.checkGameOver(game);
    game.isGameOver = finalStatus.isOver;
    game.winner = finalStatus.winner;

    // save updated game state
    await this.gameRepository.save(game);

    return GameMapper.toDto(game);
  }

  @Delete(':id')
  async deleteGame(@Param('id') id: UUID): Promise<boolean> {
    return await this.gameRepository.deleteById(id);
  }

  @Get()
  async getGames(): Promise<GameDto[]> {
    const games = await this.gameRepository.getAll();

    if (!games) return [];

    return games.map((game) => GameMapper.toDto(game));
  }
}
