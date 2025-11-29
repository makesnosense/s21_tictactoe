import {
  type Board,
  CELL,
  BOARD_SIZE,
  MoveCoordinates,
  CellValue,
} from '../../../shared/types/board';

import {
  // type Game,
  type GameResult,
  type WinningLine,
  GAME_RESULT,
  cellValueToGameResult,
} from '../../../shared/types/game';

export class GameLogic {
  static validateMove(
    currentBoard: Board,
    previousBoard: Board | null,
    playerExpectedToMakeMove: CellValue,
  ): boolean {
    if (!this.hasValidStructure(currentBoard)) return false;

    if (!previousBoard) {
      return this.validateFirstMove(currentBoard);
    }

    // single move validation
    const diffs = this.countBoardDifferences(previousBoard, currentBoard);
    if (diffs.length !== 1) return false;

    const diff = diffs[0];
    return (
      diff.oldValue === CELL.EMPTY && diff.newValue === playerExpectedToMakeMove
    );
  }

  static validateFirstMove(currentBoard: Board): boolean {
    const playerOneMoves = this.countCellsOfType(currentBoard, CELL.PLAYER_ONE);
    const playerTwoMoves = this.countCellsOfType(currentBoard, CELL.PLAYER_TWO);
    return playerOneMoves === 1 && playerTwoMoves === 0;
  }

  static hasValidStructure(board: Board): boolean {
    if (board.length !== BOARD_SIZE) return false;

    for (const row of board) {
      if (row.length !== BOARD_SIZE) return false;

      const validCellValues = Object.values(CELL);
      for (const cell of row) {
        if (!validCellValues.includes(cell)) {
          return false;
        }
      }
    }
    return true;
  }

  static countBoardDifferences(
    board1: Board,
    board2: Board,
  ): { row: number; col: number; oldValue: CellValue; newValue: CellValue }[] {
    const diffs = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board1[row][col] !== board2[row][col]) {
          diffs.push({
            row,
            col,
            oldValue: board1[row][col],
            newValue: board2[row][col],
          });
        }
      }
    }
    return diffs;
  }

  static countCellsOfType(board: Board, cellType: number): number {
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell === cellType) count++;
      }
    }
    return count;
  }

  static checkGameOver(board: Board): {
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

  static getEmptyCells(board: Board): MoveCoordinates[] {
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
}
