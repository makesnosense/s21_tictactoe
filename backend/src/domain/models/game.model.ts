import { UUID } from 'crypto';
import { Board, CELL } from './board.model';
import type { CellValue } from './board.model';
import type { ObjectValues } from 'src/common/types';

export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: 'draw',
  PLAYER_WIN: CELL.PLAYER,
  AI_WIN: CELL.AI,
} as const;

export type GameResult = ObjectValues<typeof GAME_RESULT>;

export interface Game {
  id: UUID;
  board: Board;
  isGameOver: boolean;
  winner: GameResult;
}

export const cellValueToGameResult = (cellValue: CellValue): GameResult => {
  switch (cellValue) {
    case CELL.PLAYER:
      return GAME_RESULT.PLAYER_WIN;
    case CELL.AI:
      return GAME_RESULT.AI_WIN;
    default:
      throw new Error(`Cannot convert cell value ${cellValue} to game result`);
  }
};
