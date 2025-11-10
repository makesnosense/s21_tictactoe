"use client";
import { CirclePlus } from "lucide-react";
import { BOARD_SIZE } from "../../../shared/types/board";

interface NewGameBoardProps {
  slot: number;
  onClick: (slot: number) => void;
}

export function NewGameBoard({ slot, onClick }: NewGameBoardProps) {
  return (
    <button
      onClick={() => onClick(slot)}
      className="group relative h-[calc(3*2.5rem+2*1px)] w-[calc(3*2.5rem+2*1px)] rounded border border-dashed border-zinc-100 transition-colors duration-200 hover:border-zinc-200 dark:border-zinc-700/50 dark:hover:border-zinc-700"
    >
      <div className="absolute inset-0 grid grid-cols-3 gap-px bg-white transition-colors duration-300 ease-out group-hover:bg-zinc-100 dark:bg-zinc-950 dark:group-hover:bg-zinc-800">
        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, index) => (
          <span key={index} className="bg-white dark:bg-zinc-950" />
        ))}
      </div>

      <CirclePlus className="absolute top-1/2 left-1/2 z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-zinc-300 transition-all duration-200 ease-out group-hover:scale-110 group-hover:text-zinc-400 dark:text-zinc-500" />
    </button>
  );
}
