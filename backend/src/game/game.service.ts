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
  type Game,
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

  calculateNextComputerMove(game: Game): MoveCoordinates {
    // if (Math.random() < MISTAKE_PROBABILITY) {
    //   return this.getRandomComputerMove(game);
    // } else {
    //   return this.getMinMaxedComputerMove(game);
    // }

    return this.getWeightedComputerMove(game);
  }

  getRandomComputerMove(game: Game): MoveCoordinates {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    if (emptyCells.length === 0) {
      throw new Error('No empty cells available');
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  getMinMaxedComputerMove(game: Game) {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    const cellsAndScores = [];

    for (const cell of emptyCells) {
      const boardWithNewMove = structuredClone(game.board);
      boardWithNewMove[cell.row][cell.col] = CELL.PLAYER_TWO;
      const score = this.minMax(boardWithNewMove, false, 0);
      cellsAndScores.push({ cell: cell, score: score });
    }

    cellsAndScores.sort((a, b) => b.score - a.score);

    const bestMoveComputerMove = cellsAndScores[0].cell;

    return bestMoveComputerMove;
  }

  getWeightedComputerMove(game: Game): MoveCoordinates {
    const emptyCells = GameLogic.getEmptyCells(game.board);

    const movesWithScores = emptyCells.map((cell) => {
      const boardWithMove = structuredClone(game.board);
      boardWithMove[cell.row][cell.col] = CELL.PLAYER_TWO;
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
      if (currentResult.winner === GAME_RESULT.PLAYER_WIN) return -10 + depth;
      else if (currentResult.winner === GAME_RESULT.COMPUTER_WIN)
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
        boardWithNewMove[cell.row][cell.col] = CELL.PLAYER_TWO;
        const score = this.minMax(boardWithNewMove, false, depth + 1);
        if (score > bestScore) bestScore = score;
      }
    } else {
      // is player move
      bestScore = Infinity;
      for (const cell of emptyCells) {
        const boardWithNewMove = structuredClone(board);
        boardWithNewMove[cell.row][cell.col] = CELL.PLAYER_ONE;
        const score = this.minMax(boardWithNewMove, true, depth + 1);
        if (score < bestScore) bestScore = score;
      }
    }
    return bestScore;
  }

  validatePlayerMove(game: Game, previousGame: Game | null): boolean {
    if (!GameLogic.hasValidStructure(game.board)) return false;

    if (!previousGame) {
      // new game - board should be empty or have exactly one player move
      const playerMoves = GameLogic.countCellsOfType(
        game.board,
        CELL.PLAYER_ONE,
      );
      const aiMoves = GameLogic.countCellsOfType(game.board, CELL.PLAYER_TWO);
      return playerMoves === 1 && aiMoves === 0;
    }

    // compare boards - ensure exactly ONE new move was made by player
    const diffs = GameLogic.countBoardDifferences(
      previousGame.board,
      game.board,
    );

    if (diffs.length !== 1) return false;

    const diff = diffs[0];
    return diff.oldValue === CELL.EMPTY && diff.newValue === CELL.PLAYER_ONE;
  }
}
