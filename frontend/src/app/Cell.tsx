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
      className={`grid aspect-square cursor-pointer place-items-center border border-white/20 bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:border-white/30 hover:bg-white/20`}
      onClick={onClick}
      type="button"
    >
      {getCellIcon(cellValue)}
    </button>
  );
}
