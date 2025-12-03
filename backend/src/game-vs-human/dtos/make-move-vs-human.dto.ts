import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { BOARD_SIZE, type CellValue } from '../../../../shared/types/board';

export class MakeMoveVsHumanDto {
  @IsArray()
  @ArrayMinSize(BOARD_SIZE)
  @ArrayMaxSize(BOARD_SIZE)
  board: CellValue[][];
}
