import { Board } from "./board";
import { ObjectValues } from "./utils";
export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: "draw",
  PLAYER_WIN: "player wins",
  COMPUTER_WIN: "computer wins",
} as const;

export interface WinningLine {
  start: { row: number; col: number };
  end: { row: number; col: number };
}

export type GameResult = ObjectValues<typeof GAME_RESULT>;

export interface Game {
  slot: number;
  board: Board;
  isGameOver: boolean;
  winner: GameResult;
  winningLine: WinningLine | null;
}

export const MAX_SLOTS = 24;
