import type { Game, GameResult } from 'src/domain/models/game.model';
import type { MoveCoordinates } from 'src/domain/models/board.model';

export abstract class GameServiceBase {
  abstract calculateNextMove(game: Game): MoveCoordinates;

  abstract validateBoard(game: Game): Promise<boolean>;

  abstract checkGameOver(game: Game): { isOver: boolean; winner: GameResult };
}
