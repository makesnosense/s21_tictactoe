"use client";
import { CirclePlus } from "lucide-react";
import { BOARD_SIZE } from "../../../shared/types/board";
import styles from "./NewGameBoard.module.css";

interface NewGameBoardProps {
  slot: number;
  onClick: (slot: number) => void;
}

export function NewGameBoard({ slot, onClick }: NewGameBoardProps) {
  return (
    <button
      onClick={() => onClick(slot)}
      className={`${styles["animate-fade-in"]} group relative h-[122px] w-[122px] rounded border border-dashed border-white/20 bg-white/5 transition-all duration-200 hover:border-white/30 hover:bg-white/10`}
    >
      <div className="absolute inset-0 grid grid-cols-3 gap-px rounded-sm bg-white/5 p-px transition-colors duration-300 ease-out group-hover:bg-white/10">
        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, index) => (
          <span
            key={index}
            className="aspect-square border border-white/10 bg-white/5 backdrop-blur-sm"
          />
        ))}
      </div>

      <CirclePlus className="absolute top-1/2 left-1/2 z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-white/30 transition-all duration-200 ease-out group-hover:scale-110 group-hover:text-white/50" />
    </button>
  );
}
