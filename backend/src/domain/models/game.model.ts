import { UUID } from 'crypto';
import { Board, CELL } from './board.model';
import type { CellValue } from './board.model';
import type { ObjectValues } from 'src/common/types';

export const GAME_RESULT = {
  IN_PROGRESS: null,
  DRAW: 'draw',
  PLAYER_WIN: 'player wins',
  COMPUTER_WIN: 'computer wins',
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
    case CELL.COMPUTER:
      return GAME_RESULT.COMPUTER_WIN;
    default:
      throw new Error(`Cannot convert cell value ${cellValue} to game result`);
  }
};
