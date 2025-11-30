import { IsInt, Min, Max } from 'class-validator';
import { MAX_SLOTS } from '../../../../shared/types/game';

export class CreateGameDto {
  @IsInt()
  @Min(0)
  @Max(MAX_SLOTS - 1)
  slot: number;
}
