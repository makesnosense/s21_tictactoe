import { UUID } from 'crypto';
import { CELL } from './board.model';
import type { Board, CellValue } from './board.model';
import { GAME_RESULT, type GameResult } from '../../../../shared/types/game';

export { GAME_RESULT, type GameResult };

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
