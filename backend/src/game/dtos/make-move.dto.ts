import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { BOARD_SIZE, type CellValue } from '../../../../shared/types/board';

export class MakeMoveDto {
  @IsArray()
  @ArrayMinSize(BOARD_SIZE)
  @ArrayMaxSize(BOARD_SIZE)
  board: CellValue[][]; // GameLogic.validateMove handles deeper validation it
}
