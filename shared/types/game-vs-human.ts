import { Board } from "./board";
import { ObjectValues } from "./utils";
import { WinningLine, GameResult } from "./game";
import { CellValue } from "./board";

export const GAME_VS_HUMAN_STATUS = {
  WAITING_FOR_OPPONENT: "waiting_for_opponent",
  PLAYER_ONE_TURN: "player_one_turn",
  PLAYER_TWO_TURN: "player_two_turn",
  FINISHED: "finished",
} as const;

export type GameVsHumanStatus = ObjectValues<typeof GAME_VS_HUMAN_STATUS>;

export interface GameVsHuman {
  id: string;
  board: Board;
  status: GameVsHumanStatus;
  playerOneId: string;
  playerTwoId: string | null;
  playerOneSymbol: CellValue; // CELL.PLAYER_ONE (1/X) or CELL.PLAYER_TWO (2/O)
  playerTwoSymbol: CellValue; // the other one
  winner: GameResult;
  winnerId: string | null;
  winningLine: WinningLine | null;
  createdAt: Date;
  updatedAt: Date;
}
