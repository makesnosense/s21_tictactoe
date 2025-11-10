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
import type { GameResult } from 'src/domain/models/game.model';

@Injectable()
export class GameService extends GameServiceBase {
  constructor(private readonly gameRepository: GameRepository) {
    super();
  }

  calculateNextComputerMove(game: Game): MoveCoordinates {
    const emptyCells = this.getEmptyCells(game.board);

    if (emptyCells.length === 0) {
      throw new Error('No empty cells available');
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  async validateBoard(game: Game): Promise<boolean> {
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

    const previousGame = await this.gameRepository.findBySlot(game.slot);

    if (!previousGame) {
      // new game - board should be empty or have exactly one player move
      const playerMoves = this.countCells(game.board, CELL.PLAYER);
      const aiMoves = this.countCells(game.board, CELL.COMPUTER);
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

  checkGameOver(game: Game): { isOver: boolean; winner: GameResult } {
    const { board } = game;

    // check rows
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (
        board[row][0] !== CELL.EMPTY &&
        board[row][0] === board[row][1] &&
        board[row][1] === board[row][2]
      ) {
        return { isOver: true, winner: cellValueToGameResult(board[row][0]) };
      }
    }

    // check columns
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (
        board[0][col] !== CELL.EMPTY &&
        board[0][col] === board[1][col] &&
        board[1][col] === board[2][col]
      ) {
        return { isOver: true, winner: cellValueToGameResult(board[0][col]) };
      }
    }

    // check diagonals
    if (
      board[0][0] !== CELL.EMPTY &&
      board[0][0] === board[1][1] &&
      board[1][1] === board[2][2]
    ) {
      return { isOver: true, winner: cellValueToGameResult(board[0][0]) };
    }

    if (
      board[0][2] !== CELL.EMPTY &&
      board[0][2] === board[1][1] &&
      board[1][1] === board[2][0]
    ) {
      return { isOver: true, winner: cellValueToGameResult(board[0][2]) };
    }

    // check for draw (board full)
    const boardIsFull = this.getEmptyCells(board).length === 0;

    if (boardIsFull) {
      return { isOver: true, winner: GAME_RESULT.DRAW }; // draw
    }

    return { isOver: false, winner: GAME_RESULT.IN_PROGRESS };
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

  private countCells(board: Board, cellType: number): number {
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === cellType) count++;
      }
    }
    return count;
  }
}
