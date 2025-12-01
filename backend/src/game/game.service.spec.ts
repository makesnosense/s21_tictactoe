import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GameLogic } from 'src/common/game-logic';
import { GameService } from './game.service';
import { GameStorage } from './storage/game.storage';
import { type Board, type CellValue, CELL } from '../../../shared/types/board';
import {
  type GameVsComputer,
  GAME_RESULT,
  GAME_VS_COMPUTER_STATUS,
} from '../../../shared/types/game';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const mockStorage = {
      save: vi.fn(),
      findBySlot: vi.fn(),
      deleteBySlot: vi.fn(),
      getAll: vi.fn(),
      clear: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, { provide: GameStorage, useValue: mockStorage }],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkGameOver', () => {
    it('detects horizontal win', () => {
      const board: Board = [
        [CELL.X, CELL.X, CELL.X],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe(GAME_RESULT.PLAYER_ONE_WINS);
      expect(result.winningLine).toEqual({
        start: { row: 0, col: 0 },
        end: { row: 0, col: 2 },
      });
    });

    it('detects vertical win', () => {
      const board: Board = [
        [CELL.O, CELL.EMPTY, CELL.EMPTY],
        [CELL.O, CELL.EMPTY, CELL.EMPTY],
        [CELL.O, CELL.EMPTY, CELL.EMPTY],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe(GAME_RESULT.PLAYER_TWO_WINS);
      expect(result.winningLine).toEqual({
        start: { row: 0, col: 0 },
        end: { row: 2, col: 0 },
      });
    });

    it('detects diagonal win (main)', () => {
      const board: Board = [
        [CELL.X, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.X, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.X],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe(GAME_RESULT.PLAYER_ONE_WINS);
      expect(result.winningLine).toEqual({
        start: { row: 0, col: 0 },
        end: { row: 2, col: 2 },
      });
    });

    it('detects diagonal win (anti)', () => {
      const board: Board = [
        [CELL.EMPTY, CELL.EMPTY, CELL.O],
        [CELL.EMPTY, CELL.O, CELL.EMPTY],
        [CELL.O, CELL.EMPTY, CELL.EMPTY],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe(GAME_RESULT.PLAYER_TWO_WINS);
      expect(result.winningLine).toEqual({
        start: { row: 0, col: 2 },
        end: { row: 2, col: 0 },
      });
    });

    it('detects draw', () => {
      const board: Board = [
        [CELL.X, CELL.O, CELL.X],
        [CELL.O, CELL.O, CELL.X],
        [CELL.X, CELL.X, CELL.O],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe(GAME_RESULT.DRAW);
      expect(result.winningLine).toBeNull();
    });

    it('detects game in progress', () => {
      const board: Board = [
        [CELL.X, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.O, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      const result = GameLogic.checkGameOver(board);

      expect(result.isOver).toBe(false);
      expect(result.winner).toBe(GAME_RESULT.IN_PROGRESS);
      expect(result.winningLine).toBeNull();
    });
  });

  describe('minimax algorithm', () => {
    it('takes winning move when available', () => {
      // computer can win by placing at [0,2]
      const board: Board = [
        [CELL.O, CELL.O, CELL.EMPTY],
        [CELL.X, CELL.X, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      const game: GameVsComputer = {
        slot: 0,
        board,
        status: GAME_VS_COMPUTER_STATUS.COMPUTER_TURN,
        winner: null,
        winningLine: null,
      };

      const move = service.getMinMaxedComputerMove(game);

      expect(move).toEqual({ row: 0, col: 2 });
    });

    it('blocks player from winning', () => {
      // player about to win at [0,2], computer must block
      const board: Board = [
        [CELL.X, CELL.X, CELL.EMPTY],
        [CELL.O, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      const game: GameVsComputer = {
        slot: 0,
        board,
        status: GAME_VS_COMPUTER_STATUS.COMPUTER_TURN,
        winner: null,
        winningLine: null,
      };

      const move = service.getMinMaxedComputerMove(game);

      expect(move).toEqual({ row: 0, col: 2 });
    });

    it('chooses center on empty board or early game', () => {
      const board: Board = [
        [CELL.X, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      const game: GameVsComputer = {
        slot: 0,
        board,
        status: GAME_VS_COMPUTER_STATUS.COMPUTER_TURN,
        winner: null,
        winningLine: null,
      };

      const move = service.getMinMaxedComputerMove(game);

      // center is optimal after corner move
      expect(move).toEqual({ row: 1, col: 1 });
    });

    it('never loses from any position', () => {
      // test multiple random games to ensure minimax never loses
      const testGames = 10;
      let losses = 0;

      for (let i = 0; i < testGames; i++) {
        const result = playFullGame();
        if (result === GAME_RESULT.PLAYER_ONE_WINS) {
          losses++;
        }
      }

      expect(losses).toBe(0);
    });

    // helper function to simulate a full game
    function playFullGame(): string | null {
      const board: Board = [
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
      ];

      let currentPlayer: Omit<CellValue, typeof CELL.EMPTY> = CELL.X;

      for (let turn = 0; turn < 9; turn++) {
        const gameState = GameLogic.checkGameOver(board);
        if (gameState.isOver) {
          return gameState.winner;
        }

        const game: GameVsComputer = {
          slot: 0,
          board,
          status: GAME_VS_COMPUTER_STATUS.COMPUTER_TURN,
          winner: null,
          winningLine: null,
        };

        if (currentPlayer === CELL.X) {
          // random player move
          const randomCell = service.getRandomComputerMove(game);
          board[randomCell.row][randomCell.col] = CELL.X;
          currentPlayer = CELL.O;
        } else {
          // minimax computer move
          const move = service.getMinMaxedComputerMove(game);
          board[move.row][move.col] = CELL.O;
          currentPlayer = CELL.X;
        }
      }

      return GameLogic.checkGameOver(board).winner;
    }
  });

  describe('validateBoard', () => {
    it('accepts valid first move', () => {
      const game: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.EMPTY, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const result = GameLogic.validateMove(game.board, null, CELL.X);

      expect(result).toBe(true);
    });

    it('rejects board with invalid dimensions', () => {
      const game: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const result = GameLogic.validateMove(game.board, null, CELL.X);

      expect(result).toBe(false);
    });

    it('rejects multiple moves at once', () => {
      const previousGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.EMPTY, CELL.EMPTY],
          [CELL.EMPTY, CELL.O, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const currentGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.X, CELL.EMPTY],
          [CELL.EMPTY, CELL.O, CELL.X],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const result = GameLogic.validateMove(
        currentGame.board,
        previousGame.board,
        CELL.X,
      );

      expect(result).toBe(false);
    });

    it('rejects changing existing cells', () => {
      const previousGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.EMPTY, CELL.EMPTY],
          [CELL.EMPTY, CELL.O, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const currentGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.O, CELL.EMPTY, CELL.EMPTY], // changed existing cell
          [CELL.EMPTY, CELL.O, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const result = GameLogic.validateMove(
        currentGame.board,
        previousGame.board,
        CELL.X,
      );

      expect(result).toBe(false);
    });

    it('accepts valid next move', () => {
      const previousGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.EMPTY, CELL.EMPTY],
          [CELL.EMPTY, CELL.O, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const currentGame: GameVsComputer = {
        slot: 0,
        board: [
          [CELL.X, CELL.X, CELL.EMPTY],
          [CELL.EMPTY, CELL.O, CELL.EMPTY],
          [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
        ],
        status: GAME_VS_COMPUTER_STATUS.PLAYER_TURN,
        winner: null,
        winningLine: null,
      };

      const result = GameLogic.validateMove(
        currentGame.board,
        previousGame.board,
        CELL.X,
      );

      expect(result).toBe(true);
    });
  });
});
