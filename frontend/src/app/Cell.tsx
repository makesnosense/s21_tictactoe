import { Circle, X } from "lucide-react";
import type { CellValue } from "../../../shared/types/board";

function getCellIcon(cellValue: CellValue) {
  if (cellValue === 1) return <X className="h-8 w-8" />;
  if (cellValue === 2) return <Circle className="aspect-square h-[22px]" />;
  return null;
}

interface CellProps {
  cellValue: CellValue;

  onClick: () => void;
}

export function Cell({ cellValue, onClick }: CellProps) {
  return (
    <button
      className={`grid aspect-square w-10 cursor-pointer place-items-center bg-white dark:bg-zinc-950`}
      onClick={onClick}
      type="button"
    >
      {getCellIcon(cellValue)}
    </button>
  );
}
