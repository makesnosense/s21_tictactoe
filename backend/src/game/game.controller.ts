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
import { GameLogic } from 'src/common/game-logic';
import { GameService } from './game.service';

import { GameStorage } from './storage/game.storage';
import { CELL } from '../../../shared/types/board';

import { createEmptyBoard } from '../../../shared/types/board';

import { CreateGameDto } from './dtos/create-game.dto';
import { MakeMoveDto } from './dtos/make-move.dto';

import {
  GAME_VS_COMPUTER_STATUS,
  type GameVsComputer,
} from '../../../shared/types/game';

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
    private readonly gameService: GameService,
    private readonly gameStorage: GameStorage,
  ) {}

  async onModuleInit() {
    // clean up any finished games that should have been deleted before restart
    const allGames = await this.gameStorage.getAll();
    if (allGames) {
      const finishedGames = allGames.filter(
        (game) => game.status === GAME_VS_COMPUTER_STATUS.FINISHED,
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
  async createNewGame(
    @Body() createGameDto: CreateGameDto,
  ): Promise<GameVsComputer> {
    const newGame: GameVsComputer = {
      slot: createGameDto.slot,
      board: createEmptyBoard(),
      status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
      winner: null,
      winningLine: null,
    };

    await this.gameStorage.save(newGame);

    this.eventSubject.next({
      data: { type: 'game:created', slot: newGame.slot },
    });

    return newGame;
  }

  @Post(':slot')
  async makeMove(
    @Param('slot', ParseIntPipe) slot: number,
    @Body() makeMoveDto: MakeMoveDto,
  ): Promise<GameVsComputer> {
    const existingGame = await this.gameStorage.findBySlot(slot);

    if (existingGame?.status !== GAME_VS_COMPUTER_STATUS.PLAYER_TURN) {
      throw new HttpException('Not player turn', HttpStatus.BAD_REQUEST);
    }

    const isValid = GameLogic.validateMove(
      makeMoveDto.board,
      existingGame.board,
      CELL.PLAYER_ONE,
    );
    if (!isValid) {
      throw new HttpException(
        'Invalid game state or move',
        HttpStatus.BAD_REQUEST,
      );
    }

    // constructing full domain model
    const game: GameVsComputer = {
      slot,
      board: makeMoveDto.board,
      status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
      winner: null,
      winningLine: null,
    };

    // check if game is already over before computer move
    const gameStatus = GameLogic.checkGameOver(game.board);
    if (gameStatus.isOver) {
      game.status = GAME_VS_COMPUTER_STATUS.FINISHED;
      game.winner = gameStatus.winner;
      game.winningLine = gameStatus.winningLine;
      await this.gameStorage.save(game);

      this.eventSubject.next({
        data: { type: 'game:updated', slot: game.slot },
      });

      this.scheduleDeletion(game.slot);

      return game;
    }

    game.status = GAME_VS_COMPUTER_STATUS.COMPUTER_TURN;
    await this.gameStorage.save(game);
    this.eventSubject.next({
      data: { type: 'game:updated', slot: game.slot },
    });

    // schedule computer move asynchronously
    this.scheduleComputerMove(game).catch((error) => {
      console.error(`Computer move failed for slot ${slot}:`, error);
    });

    return game;
  }
  private async scheduleComputerMove(game: GameVsComputer): Promise<void> {
    await sleep(COMPUTER_MOVE_DELAY_MS);
    const computerMove = this.gameService.calculateNextComputerMove(game);
    game.board[computerMove.row][computerMove.col] = CELL.PLAYER_TWO;

    // check if game is over AFTER computer move
    const finalStatus = GameLogic.checkGameOver(game.board);

    game.status = finalStatus.isOver
      ? GAME_VS_COMPUTER_STATUS.FINISHED
      : GAME_VS_COMPUTER_STATUS.PLAYER_TURN;
    game.winner = finalStatus.winner;
    game.winningLine = finalStatus.winningLine;

    // save updated game state
    await this.gameStorage.save(game);
    this.eventSubject.next({
      data: { type: 'game:updated', slot: game.slot },
    });

    if (game.status === GAME_VS_COMPUTER_STATUS.FINISHED) {
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

    const result = await this.gameStorage.deleteBySlot(slot);
    if (result) {
      this.eventSubject.next({
        data: { type: 'game:deleted', slot },
      });
    }
    return result;
  }

  @Get()
  async getGames(): Promise<GameVsComputer[]> {
    const games = await this.gameStorage.getAll();

    if (!games) return [];

    return games;
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
