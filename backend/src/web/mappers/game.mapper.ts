import type { Game } from 'src/domain/models/game.model';
import type { GameDto } from 'src/web/models/game.dto';

export class GameMapper {
  static toDto(game: Game): GameDto {
    return game;
  }

  static toDomain(dto: GameDto): Game {
    return dto;
  }
}
