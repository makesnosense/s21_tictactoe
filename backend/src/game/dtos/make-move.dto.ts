import {
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { MAX_SLOTS } from '../../../../shared/types/game';
import { BOARD_SIZE, type CellValue } from '../../../../shared/types/board';

export class MakeMoveDto {
  @IsInt()
  @Min(0)
  @Max(MAX_SLOTS - 1)
  slot: number;

  @IsArray()
  @ArrayMinSize(BOARD_SIZE)
  @ArrayMaxSize(BOARD_SIZE)
  board: CellValue[][]; // GameLogic.validateMove handles deeper validation it
}
