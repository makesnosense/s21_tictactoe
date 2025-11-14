import type {
  Game,
  GameResult,
  WinningLine,
} from 'src/domain/models/game.model';

import type { Board } from 'src/domain/models/board.model';

import type { MoveCoordinates } from 'src/domain/models/board.model';

export abstract class GameServiceBase {
  abstract calculateNextComputerMove(game: Game): MoveCoordinates;

  abstract validateBoard(game: Game, previousGame: Game | null): boolean;

  abstract checkGameOver(board: Board): {
    isOver: boolean;
    winner: GameResult;
    winningLine: WinningLine | null;
  };
}
