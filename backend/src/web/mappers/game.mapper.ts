import type { Game } from 'src/domain/models/game.model';
import type { GameDto } from 'src/web/models/game.dto';

export class GameMapper {
  // trivial passthrough mappers – satisfies school 21 task requirements
  static toDto(game: Game): GameDto {
    return game; // they're identical anyway
  }

  static toDomain(dto: GameDto): Game {
    return dto; // they're identical anyway
  }
}
