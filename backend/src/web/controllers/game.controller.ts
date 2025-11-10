import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Get,
  Delete,
  ParseIntPipe,
  Sse,
} from '@nestjs/common';

import { Observable, Subject } from 'rxjs';
import { GameServiceBase } from 'src/domain/services/game.service.interface';
import { GameRepository } from 'src/datasource/repositories/game.repository';
import { GameMapper } from '../mappers/game.mapper';
import { CELL } from 'src/domain/models/board.model';

import { createEmptyBoard } from '../../../../shared/types/board';

import type { GameDto } from '../models/game.dto';
import { Game } from 'src/domain/models/game.model';

interface GameUpdateEvent {
  data: {
    type: 'game:updated' | 'game:created' | 'game:deleted';
    slot: number;
  };
}

@Controller('games')
export class GameController {
  private eventSubject = new Subject<GameUpdateEvent>();
  private deletionTimers = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly gameService: GameServiceBase,
    private readonly gameRepository: GameRepository,
  ) {}

  onModuleDestroy() {
    this.deletionTimers.forEach((timer) => clearTimeout(timer));
    this.deletionTimers.clear();
  }

  @Sse('events')
  streamEvents(): Observable<GameUpdateEvent> {
    return this.eventSubject.asObservable();
  }

  @Post()
  async createNewGame(@Body() body: { slot: number }): Promise<GameDto> {
    const newGame: Game = {
      slot: body.slot,
      board: createEmptyBoard(),
      isGameOver: false,
      winner: null,
    };

    await this.gameRepository.save(newGame);

    this.eventSubject.next({
      data: { type: 'game:created', slot: newGame.slot },
    });

    return GameMapper.toDto(newGame);
  }

  @Post(':slot')
  async makeMove(
    @Param('slot', ParseIntPipe) slot: number,
    @Body() gameDto: GameDto,
  ): Promise<GameDto> {
    const game = GameMapper.toDomain(gameDto);

    const existingGame = await this.gameRepository.findBySlot(slot);
    if (existingGame?.isGameOver) {
      throw new HttpException('Game has already ended', HttpStatus.BAD_REQUEST);
    }

    const isValid = await this.gameService.validateBoard(game, existingGame);
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

      this.eventSubject.next({
        data: { type: 'game:updated', slot: game.slot },
      });

      // schedule deletion after 5 seconds
      this.scheduleDeletion(game.slot);

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

    this.eventSubject.next({
      data: { type: 'game:updated', slot: game.slot },
    });

    if (game.isGameOver) {
      this.scheduleDeletion(game.slot);
    }

    return GameMapper.toDto(game);
  }

  @Delete(':slot')
  async deleteGame(
    @Param('slot', ParseIntPipe) slot: number,
  ): Promise<boolean> {
    if (this.deletionTimers.has(slot)) {
      clearTimeout(this.deletionTimers.get(slot));
      this.deletionTimers.delete(slot);
    }

    const result = await this.gameRepository.deleteBySlot(slot);
    if (result) {
      this.eventSubject.next({
        data: { type: 'game:deleted', slot },
      });
    }
    return result;
  }

  @Get()
  async getGames(): Promise<GameDto[]> {
    const games = await this.gameRepository.getAll();

    if (!games) return [];

    return games.map((game) => GameMapper.toDto(game));
  }

  private scheduleDeletion(slot: number): void {
    if (this.deletionTimers.has(slot)) {
      return;
    }

    const timer = setTimeout(() => {
      this.deleteGame(slot).catch((error) => {
        console.error(`Failed to auto-delete game in slot ${slot}:`, error);
      });
    }, 5000);

    this.deletionTimers.set(slot, timer);
  }
}
