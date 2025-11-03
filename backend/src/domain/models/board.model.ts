import type { ObjectValues } from 'src/common/types';

export const BOARD_SIZE = 3;

export const CELL = {
  EMPTY: 0,
  PLAYER: 1,
  COMPUTER: 2,
} as const;

export type CellValue = ObjectValues<typeof CELL>;

export interface MoveCoordinates {
  row: number;
  col: number;
}

export type Board = CellValue[][];
