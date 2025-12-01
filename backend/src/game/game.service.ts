import { Injectable } from '@nestjs/common';
import { GameLogic } from 'src/common/game-logic';
import { GameStorage } from './storage/game.storage';
import {
  type Board,
  CELL,
  // BOARD_SIZE,
  MoveCoordinates,
} from '../../../shared/types/board';

import {
  type GameVsComputer,
  // type GameResult,
  // type WinningLine,
  GAME_RESULT,
  // cellValueToGameResult,
} from '../../../shared/types/game';

// higher temperature = more random, lower = more deterministic
const TEMPERATURE = 2;

// const MISTAKE_PROBABILITY = 0.3;

@Injectable()
export class GameService {
  constructor(private readonly gameStorage: GameStorage) {}

  calculateNextComputerMove(game: GameVsComputer): MoveCoordinates {
    // if (Math.random() < MISTAKE_PROBABILITY) {
    //   return this.getRandomComputerMove(game);
    // } else {
    //   return this.getMinMaxedComputerMove(game);
    // }

    return this.getWeightedComputerMove(game);
  }

  getRandomComputerMove(game: GameVsComputer): MoveCoordinates {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    if (emptyCells.length === 0) {
      throw new Error('No empty cells available');
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  getMinMaxedComputerMove(game: GameVsComputer) {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    const cellsAndScores = [];

    for (const cell of emptyCells) {
      const boardWithNewMove = structuredClone(game.board);
      boardWithNewMove[cell.row][cell.col] = CELL.O;
      const score = this.minMax(boardWithNewMove, false, 0);
      cellsAndScores.push({ cell: cell, score: score });
    }

    cellsAndScores.sort((a, b) => b.score - a.score);

    const bestMoveComputerMove = cellsAndScores[0].cell;

    return bestMoveComputerMove;
  }

  getWeightedComputerMove(game: GameVsComputer): MoveCoordinates {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    const movesWithScores = emptyCells.map((cell) => {
      const boardWithMove = structuredClone(game.board);
      boardWithMove[cell.row][cell.col] = CELL.O;
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
    const currentResult = GameLogic.checkGameOver(board);
    if (currentResult.isOver) {
      if (currentResult.winner === GAME_RESULT.PLAYER_ONE_WINS)
        return -10 + depth;
      else if (currentResult.winner === GAME_RESULT.PLAYER_TWO_WINS)
        return 10 - depth;
      else {
        return 0;
      }
    }

    const emptyCells = GameLogic.getEmptyCells(board);

    let bestScore;

    if (isMaximizing) {
      // is computer move
      bestScore = -Infinity;

      for (const cell of emptyCells) {
        const boardWithNewMove = structuredClone(board);
        boardWithNewMove[cell.row][cell.col] = CELL.O;
        const score = this.minMax(boardWithNewMove, false, depth + 1);
        if (score > bestScore) bestScore = score;
      }
    } else {
      // is player move
      bestScore = Infinity;
      for (const cell of emptyCells) {
        const boardWithNewMove = structuredClone(board);
        boardWithNewMove[cell.row][cell.col] = CELL.X;
        const score = this.minMax(boardWithNewMove, true, depth + 1);
        if (score < bestScore) bestScore = score;
      }
    }
    return bestScore;
  }
}
