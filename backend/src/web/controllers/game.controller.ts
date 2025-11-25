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
import { GAME_STATUS } from 'src/domain/models/game.model';

import { createEmptyBoard } from '../../../../shared/types/board';

import type { GameDto } from '../models/game.dto';
import type { Game } from 'src/domain/models/game.model';

interface GameUpdateEvent {
  data: {
    type: 'game:updated' | 'game:created' | 'game:deleted';
    slot: number;
  };
}

const COMPUTER_MOVE_DELAY_MS = 900;
const GAME_DELETION_DELAY_MS = 5000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Controller('games')
export class GameController {
  private eventSubject = new Subject<GameUpdateEvent>();
  private deletionTimers = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly gameService: GameServiceBase,
    private readonly gameRepository: GameRepository,
  ) {}

  async onModuleInit() {
    // clean up any finished games that should have been deleted before restart
    const allGames = await this.gameRepository.getAll();
    if (allGames) {
      const finishedGames = allGames.filter(
        (game) => game.status === GAME_STATUS.FINISHED,
      );

      for (const game of finishedGames) {
        this.scheduleDeletion(game.slot);
      }

      if (finishedGames.length > 0) {
        console.log(
          `Scheduled deletion for ${finishedGames.length} finished game(s) on startup`,
        );
      }
    }
  }

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
      status: GAME_STATUS.PLAYER_TURN,
      winner: null,
      winningLine: null,
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

    if (existingGame?.status !== GAME_STATUS.PLAYER_TURN) {
      throw new HttpException('Not player turn', HttpStatus.BAD_REQUEST);
    }

    const isValid = this.gameService.validateBoard(game, existingGame);
    if (!isValid) {
      throw new HttpException(
        'Invalid game state or move',
        HttpStatus.BAD_REQUEST,
      );
    }

    // check if game is already over before computer move
    const gameStatus = this.gameService.checkGameOver(game.board);
    if (gameStatus.isOver) {
      game.status = GAME_STATUS.FINISHED;
      game.winner = gameStatus.winner;
      game.winningLine = gameStatus.winningLine;
      await this.gameRepository.save(game);

      this.eventSubject.next({
        data: { type: 'game:updated', slot: game.slot },
      });

      this.scheduleDeletion(game.slot);

      return GameMapper.toDto(game);
    }

    game.status = GAME_STATUS.COMPUTER_TURN;
    await this.gameRepository.save(game);
    this.eventSubject.next({
      data: { type: 'game:updated', slot: game.slot },
    });

    // schedule computer move asynchronously
    this.scheduleComputerMove(game).catch((error) => {
      console.error(`Computer move failed for slot ${slot}:`, error);
    });

    return GameMapper.toDto(game);
  }
  private async scheduleComputerMove(game: Game): Promise<void> {
    await sleep(COMPUTER_MOVE_DELAY_MS);
    const computerMove = this.gameService.calculateNextComputerMove(game);
    game.board[computerMove.row][computerMove.col] = CELL.COMPUTER;

    // check if game is over AFTER computer move
    const finalStatus = this.gameService.checkGameOver(game.board);

    game.status = finalStatus.isOver
      ? GAME_STATUS.FINISHED
      : GAME_STATUS.PLAYER_TURN;
    game.winner = finalStatus.winner;
    game.winningLine = finalStatus.winningLine;

    // save updated game state
    await this.gameRepository.save(game);
    this.eventSubject.next({
      data: { type: 'game:updated', slot: game.slot },
    });

    if (game.status === GAME_STATUS.FINISHED) {
      this.scheduleDeletion(game.slot);
    }
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
    }, GAME_DELETION_DELAY_MS);

    this.deletionTimers.set(slot, timer);
  }
}
