import { Board } from "./board";
import { ObjectValues } from "./utils";
export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: "draw",
  PLAYER_WIN: "player wins",
  COMPUTER_WIN: "computer wins",
} as const;

export type GameResult = ObjectValues<typeof GAME_RESULT>;

export interface Game {
  id: string;
  board: Board;
  isGameOver: boolean;
  winner: GameResult;
}
