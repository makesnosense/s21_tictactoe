import type { UUID } from 'crypto';

export type BoardDto = number[][];
import type { Board } from 'src/domain/models/board.model';
import type { GameResult } from 'src/domain/models/game.model';

export interface GameDto {
  id: UUID;
  board: Board;
  isGameOver: boolean;
  winner: GameResult;
}
