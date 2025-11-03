import type { ObjectValues } from 'src/common/types';

export const CELL = {
  EMPTY: 0,
  PLAYER: 1,
  AI: 2,
} as const;

export type CellValue = ObjectValues<typeof CELL>;

export type Board = CellValue[][];

// export const createEmptyBoard = (): Board => [
//   [CellValue.EMPTY, CellValue.EMPTY, CellValue.EMPTY],
//   [CellValue.EMPTY, CellValue.EMPTY, CellValue.EMPTY],
//   [CellValue.EMPTY, CellValue.EMPTY, CellValue.EMPTY],
// ];
