import { Board, CELL, type CellValue } from "./board";
import { ObjectValues } from "./utils";
export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: "draw",
  PLAYER_WIN: "player wins",
  COMPUTER_WIN: "computer wins",
} as const;

export type GameResult = ObjectValues<typeof GAME_RESULT>;

export const cellValueToGameResult = (cellValue: CellValue): GameResult => {
  switch (cellValue) {
    case CELL.PLAYER_ONE:
      return GAME_RESULT.PLAYER_WIN;
    case CELL.PLAYER_TWO:
      return GAME_RESULT.COMPUTER_WIN;
    default:
      throw new Error(`Cannot convert cell value ${cellValue} to game result`);
  }
};

export const GAME_STATUS = {
  PLAYER_TURN: "player_turn",
  COMPUTER_TURN: "computer_turn",
  FINISHED: "finished",
} as const;

export type GameStatus = ObjectValues<typeof GAME_STATUS>;

export interface WinningLine {
  start: { row: number; col: number };
  end: { row: number; col: number };
}

export interface Game {
  slot: number; // acts as unique identifier (UUID) for the game
  board: Board;
  status: GameStatus;
  winner: GameResult;
  winningLine: WinningLine | null;
}

export const MAX_SLOTS = 24;
