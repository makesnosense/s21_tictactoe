import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { GameVsHumanStorage } from './storage/game-vs-human.storage';
import { GameLogic } from 'src/common/game-logic';
import { CELL, createEmptyBoard } from '../../../shared/types/board';
import {
  GAME_VS_HUMAN_STATUS,
  type GameVsHuman,
} from '../../../shared/types/game-vs-human';
import { GAME_RESULT } from '../../../shared/types/game';

@Injectable()
export class GameVsHumanService {
  constructor(private readonly storage: GameVsHumanStorage) {}

  async createGame(userId: string): Promise<GameVsHuman> {
    // check if user already has an active game
    const existingGame = await this.storage.findActiveGameByUserId(userId);
    if (existingGame) {
      throw new ConflictException(
        'User already has an active game. Finish or abandon it first.',
      );
    }

    // randomly assign symbols
    const playerOneSymbol = Math.random() < 0.5 ? CELL.X : CELL.O;
    const playerTwoSymbol = playerOneSymbol === CELL.X ? CELL.O : CELL.X;

    const game = await this.storage.create({
      board: createEmptyBoard(),
      status: GAME_VS_HUMAN_STATUS.WAITING_FOR_OPPONENT,
      playerOneId: userId,
      playerTwoId: null,
      playerOneSymbol,
      playerTwoSymbol,
      winner: GAME_RESULT.IN_PROGRESS,
      winnerId: null,
      winningLine: null,
    });

    return game;
  }

  async getAvailableGames(): Promise<GameVsHuman[]> {
    return this.storage.findAvailableGames();
  }

  async joinGame(gameId: string, userId: string): Promise<GameVsHuman> {
    const game = await this.storage.findById(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== GAME_VS_HUMAN_STATUS.WAITING_FOR_OPPONENT) {
      throw new BadRequestException('Game is not waiting for players');
    }

    if (game.playerOneId === userId) {
      throw new BadRequestException('Cannot join your own game');
    }

    // check if joining user already has an active game
    const existingGame = await this.storage.findActiveGameByUserId(userId);
    if (existingGame) {
      throw new ConflictException(
        'User already has an active game. Finish or abandon it first.',
      );
    }

    // determine who starts (X always goes first)
    const firstTurnStatus =
      game.playerOneSymbol === CELL.X
        ? GAME_VS_HUMAN_STATUS.PLAYER_ONE_TURN
        : GAME_VS_HUMAN_STATUS.PLAYER_TWO_TURN;

    const updatedGame = await this.storage.update(gameId, {
      playerTwoId: userId,
      status: firstTurnStatus,
    });

    return updatedGame;
  }

  async makeMove(
    gameId: string,
    userId: string,
    board: GameVsHuman['board'],
  ): Promise<GameVsHuman> {
    const game = await this.storage.findById(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status === GAME_VS_HUMAN_STATUS.WAITING_FOR_OPPONENT) {
      throw new BadRequestException('Game is waiting for second player');
    }

    if (game.status === GAME_VS_HUMAN_STATUS.FINISHED) {
      throw new BadRequestException('Game is already finished');
    }

    // determine whose turn it is
    const isPlayerOneTurn =
      game.status === GAME_VS_HUMAN_STATUS.PLAYER_ONE_TURN;
    const isPlayerTwoTurn =
      game.status === GAME_VS_HUMAN_STATUS.PLAYER_TWO_TURN;

    if (isPlayerOneTurn && userId !== game.playerOneId) {
      throw new BadRequestException('Not your turn');
    }

    if (isPlayerTwoTurn && userId !== game.playerTwoId) {
      throw new BadRequestException('Not your turn');
    }

    // validate the move
    const expectedSymbol = isPlayerOneTurn
      ? game.playerOneSymbol
      : game.playerTwoSymbol;

    const isValid = GameLogic.validateMove(board, game.board, expectedSymbol);

    if (!isValid) {
      throw new BadRequestException('Invalid move');
    }

    // check if game is over
    const gameStatus = GameLogic.checkGameOver(board);

    let updatedGame: GameVsHuman;

    if (gameStatus.isOver) {
      // determine winner
      let winnerId: string | null = null;
      if (gameStatus.winner === GAME_RESULT.PLAYER_ONE_WINS) {
        winnerId =
          game.playerOneSymbol === CELL.X ? game.playerOneId : game.playerTwoId;
      } else if (gameStatus.winner === GAME_RESULT.PLAYER_TWO_WINS) {
        winnerId =
          game.playerTwoSymbol === CELL.O ? game.playerTwoId : game.playerOneId;
      }

      updatedGame = await this.storage.update(gameId, {
        board,
        status: GAME_VS_HUMAN_STATUS.FINISHED,
        winner: gameStatus.winner,
        winnerId,
        winningLine: gameStatus.winningLine,
      });
    } else {
      // switch turns
      const nextStatus = isPlayerOneTurn
        ? GAME_VS_HUMAN_STATUS.PLAYER_TWO_TURN
        : GAME_VS_HUMAN_STATUS.PLAYER_ONE_TURN;

      updatedGame = await this.storage.update(gameId, {
        board,
        status: nextStatus,
      });
    }

    return updatedGame;
  }

  async getGame(gameId: string): Promise<GameVsHuman> {
    const game = await this.storage.findById(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async getActiveGameByUserId(userId: string): Promise<GameVsHuman | null> {
    return this.storage.findActiveGameByUserId(userId);
  }
}
