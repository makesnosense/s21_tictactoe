import { Board, CELL, type CellValue } from "./board";
import { ObjectValues } from "./utils";
export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: "draw",
  PLAYER_ONE_WINS: "player wins",
  PLAYER_TWO_WINS: "player two wins",
} as const;

export type GameResult = ObjectValues<typeof GAME_RESULT>;

export const cellValueToGameResult = (cellValue: CellValue): GameResult => {
  switch (cellValue) {
    case CELL.PLAYER_ONE:
      return GAME_RESULT.PLAYER_ONE_WINS;
    case CELL.PLAYER_TWO:
      return GAME_RESULT.PLAYER_TWO_WINS;
    default:
      throw new Error(`Cannot convert cell value ${cellValue} to game result`);
  }
};

export interface WinningLine {
  start: { row: number; col: number };
  end: { row: number; col: number };
}

export const GAME_VS_COMPUTER_STATUS = {
  PLAYER_TURN: "player_turn",
  COMPUTER_TURN: "computer_turn",
  FINISHED: "finished",
} as const;

export type GameVsComputerStatus = ObjectValues<typeof GAME_VS_COMPUTER_STATUS>;

export interface GameVsComputer {
  slot: number; // acts as unique identifier (UUID) for the game
  board: Board;
  status: GameVsComputerStatus;
  winner: GameResult;
  winningLine: WinningLine | null;
}

export const MAX_SLOTS = 24;
