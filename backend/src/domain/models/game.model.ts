import { CELL } from './board.model';
import type { CellValue } from './board.model';
import {
  GAME_RESULT,
  type GameResult,
  GAME_STATUS,
  type GameStatus,
} from '../../../../shared/types/game';

export type { Game, WinningLine } from '../../../../shared/types/game';
export { GAME_RESULT, type GameResult, GAME_STATUS, type GameStatus };

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
