import { validate } from 'uuid';
import type { UUID } from 'crypto';
import type { Game } from 'src/domain/models/game.model';
import type { GameDto } from 'src/web/models/game.dto';

function isUUID(value: string): value is UUID {
  return validate(value);
}
export class GameMapper {
  static toDto(game: Game): GameDto {
    return {
      ...game,
      id: game.id.toString(),
    };
  }

  static toDomain(dto: GameDto): Game {
    if (!isUUID(dto.id)) {
      throw new Error(`Invalid UUID: ${dto.id}`);
    }

    return {
      ...dto,
      id: dto.id,
    };
  }
}
