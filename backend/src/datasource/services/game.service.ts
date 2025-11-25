import { Injectable } from '@nestjs/common';
import { GameRepository } from 'src/datasource/repositories/game.repository';
import { GameServiceBase } from 'src/domain/services/game.service.interface';
import {
  CELL,
  BOARD_SIZE,
  MoveCoordinates,
} from 'src/domain/models/board.model';

import { GAME_RESULT } from 'src/domain/models/game.model';
import { cellValueToGameResult } from 'src/domain/models/game.model';

import type { Game } from 'src/datasource/models/game.model';
import type { Board } from 'src/datasource/models/board.model';
import type { GameResult, WinningLine } from 'src/domain/models/game.model';

// higher temperature = more random, lower = more deterministic
const TEMPERATURE = 2;

// const MISTAKE_PROBABILITY = 0.3;

@Injectable()
export class GameService extends GameServiceBase {
  constructor(private readonly gameRepository: GameRepository) {
    super();
  }

  calculateNextComputerMove(game: Game): MoveCoordinates {
    // if (Math.random() < MISTAKE_PROBABILITY) {
    //   return this.getRandomComputerMove(game);
    // } else {
    //   return this.getMinMaxedComputerMove(game);
    // }

    return this.getWeightedComputerMove(game);
  }

  getRandomComputerMove(game: Game): MoveCoordinates {
    const emptyCells = this.getEmptyCells(game.board);

    if (emptyCells.length === 0) {
      throw new Error('No empty cells available');
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  getMinMaxedComputerMove(game: Game) {
    const emptyCells = this.getEmptyCells(game.board);

    const cellsAndScores = [];

    for (const cell of emptyCells) {
      const boardWithNewMove = structuredClone(game.board);
      boardWithNewMove[cell.row][cell.col] = CELL.COMPUTER;
      const score = this.minMax(boardWithNewMove, false, 0);
      cellsAndScores.push({ cell: cell, score: score });
    }

    cellsAndScores.sort((a, b) => b.score - a.score);

    const bestMoveComputerMove = cellsAndScores[0].cell;

    return bestMoveComputerMove;
  }

  getWeightedComputerMove(game: Game): MoveCoordinates {
    const emptyCells = this.getEmptyCells(game.board);

    const movesWithScores = emptyCells.map((cell) => {
      const boardWithMove = structuredClone(game.board);
      boardWithMove[cell.row][cell.col] = CELL.COMPUTER;
      const score = this.minMax(boardWithMove, false, 0);
      return { cell, score };
    });

    // softmax: convert scores to probabilities
    const weights = movesWithScores.map((move) =>
      Math.exp(move.score / TEMPERATURE),
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let random = Math.random() * totalWeight;

    // this way we avoid explicit normalization
    for (let i = 0; i < movesWithScores.length; i++) {
      random -= weights[i];
      if (random <= 0) return movesWithScores[i].cell;
    }

    return movesWithScores[0].cell; // fallback
  }

  minMax(board: Board, isMaximizing: boolean, depth: number): number {
    const currentResult = this.checkGameOver(board);
    if (currentResult.isOver) {
      if (currentResult.winner === GAME_RESULT.PLAYER_WIN) return -10 + depth;
      else if (currentResult.winner === GAME_RESULT.COMPUTER_WIN)
        return 10 - depth;
      else {
        return 0;
      }
    }

    const emptyCells = this.getEmptyCells(board);

    let bestScore;

    if (isMaximizing) {
      // is computer move
      bestScore = -Infinity;

      for (const cell of emptyCells) {
        const boardWithNewMove = structuredClone(board);
        boardWithNewMove[cell.row][cell.col] = CELL.COMPUTER;
        const score = this.minMax(boardWithNewMove, false, depth + 1);
        if (score > bestScore) bestScore = score;
      }
    } else {
      // is player move
      bestScore = Infinity;
      for (const cell of emptyCells) {
        const boardWithNewMove = structuredClone(board);
        boardWithNewMove[cell.row][cell.col] = CELL.PLAYER;
        const score = this.minMax(boardWithNewMove, true, depth + 1);
        if (score < bestScore) bestScore = score;
      }
    }
    return bestScore;
  }

  checkGameOver(board: Board): {
    isOver: boolean;
    winner: GameResult;
    winningLine: WinningLine | null;
  } {
    // check rows
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (
        board[row][0] !== CELL.EMPTY &&
        board[row][0] === board[row][1] &&
        board[row][1] === board[row][2]
      ) {
        return {
          isOver: true,
          winner: cellValueToGameResult(board[row][0]),
          winningLine: { start: { row, col: 0 }, end: { row, col: 2 } },
        };
      }
    }

    // check columns
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        board[0][col] !== CELL.EMPTY &&
        board[0][col] === board[1][col] &&
        board[1][col] === board[2][col]
      ) {
        return {
          isOver: true,
          winner: cellValueToGameResult(board[0][col]),
          winningLine: { start: { row: 0, col }, end: { row: 2, col } },
        };
      }
    }

    // check main diagonal
    if (
      board[0][0] !== CELL.EMPTY &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      return {
        isOver: true,
        winner: cellValueToGameResult(board[0][0]),
        winningLine: { start: { row: 0, col: 0 }, end: { row: 2, col: 2 } },
      };
    }

    // check anti-diagonal
    if (
      board[0][2] !== CELL.EMPTY &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      return {
        isOver: true,
        winner: cellValueToGameResult(board[0][2]),
        winningLine: { start: { row: 0, col: 2 }, end: { row: 2, col: 0 } },
      };
    }

    const boardIsFull = this.getEmptyCells(board).length === 0;

    if (boardIsFull) {
      return { isOver: true, winner: GAME_RESULT.DRAW, winningLine: null };
    }

    return {
      isOver: false,
      winner: GAME_RESULT.IN_PROGRESS,
      winningLine: null,
    };
  }

  private getEmptyCells(board: Board): MoveCoordinates[] {
    const emptyCells: MoveCoordinates[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === CELL.EMPTY) {
          emptyCells.push({ row, col });
        }
      }
    }
    return emptyCells;
  }

  private countCellsOfType(board: Board, cellType: number): number {
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === cellType) count++;
      }
    }
    return count;
  }

  validateBoard(game: Game, previousGame: Game | null): boolean {
    if (game.board.length !== BOARD_SIZE) return false;

    for (const row of game.board) {
      if (row.length !== BOARD_SIZE) return false;

      const validCellValues = Object.values(CELL);
      for (const cell of row) {
        if (!validCellValues.includes(cell)) {
          return false;
        }
      }
    }

    // const previousGame = await this.gameRepository.findBySlot(game.slot);

    if (!previousGame) {
      // new game - board should be empty or have exactly one player move
      const playerMoves = this.countCellsOfType(game.board, CELL.PLAYER);
      const aiMoves = this.countCellsOfType(game.board, CELL.COMPUTER);
      return playerMoves === 1 && aiMoves === 0;
    }

    // compare boards - ensure exactly ONE new move was made by player
    let differences = 0;
    let validPlayerMove = false;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const oldCell = previousGame.board[row][col];
        const newCell = game.board[row][col];

        if (oldCell !== newCell) {
          differences++;
          // the change must be: empty → player
          if (oldCell === CELL.EMPTY && newCell === CELL.PLAYER) {
            validPlayerMove = true;
          } else {
            // invalid change (changed existing move or added COMPUTER move)
            return false;
          }
        }
      }
    }

    // must be exactly one difference and it must be a valid player move
    return differences === 1 && validPlayerMove;
  }
}
