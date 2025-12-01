import { ObjectValues } from "./utils";

export const BOARD_SIZE = 3;

export const CELL = {
  EMPTY: 0,
  X: 1,
  O: 2,
} as const;

export type CellValue = ObjectValues<typeof CELL>;

export interface MoveCoordinates {
  row: number;
  col: number;
}

export type Board = CellValue[][];

export function createEmptyBoard(): Board {
  return [
    [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
    [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
    [CELL.EMPTY, CELL.EMPTY, CELL.EMPTY],
  ];
}
