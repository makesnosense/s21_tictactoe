import { UUID } from 'crypto';
import { Board, CELL } from './board.model';
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
