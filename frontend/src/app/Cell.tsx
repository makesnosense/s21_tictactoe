import { Circle, X } from "lucide-react";
import type { CellValue } from "../../../shared/types/board";

function getCellIcon(cell: CellValue) {
  if (cell === 1) return <X className="h-8 w-8" />;
  if (cell === 2) return <Circle className="aspect-square h-[22px]" />;
  return null;
}

interface CellProps {
  cell: CellValue;
  onClick: () => void;
}

export function Cell({ cell, onClick }: CellProps) {
  return (
    <button
      className="grid aspect-square w-10 place-items-center bg-white dark:bg-zinc-950"
      onClick={onClick}
      type="button"
    >
      {getCellIcon(cell)}
    </button>
  );
}
