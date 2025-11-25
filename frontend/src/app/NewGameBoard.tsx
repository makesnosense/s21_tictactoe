"use client";
import { memo } from "react";
import { CirclePlus } from "lucide-react";
import { BOARD_SIZE } from "../../../shared/types/board";
import styles from "./NewGameBoard.module.css";

interface NewGameBoardProps {
  slot: number;
  onClick: (slot: number) => void;
}

export const NewGameBoard = memo(function NewGameBoard({
  slot,
  onClick,
}: NewGameBoardProps) {
  return (
    <button
      onClick={() => onClick(slot)}
      className={`${styles["animate-fade-in"]} group relative h-[122px] w-[122px] rounded border border-dashed border-white/40 transition-all duration-200 hover:border-white/30 hover:bg-white/10`}
    >
      <CirclePlus className="absolute top-1/2 left-1/2 z-10 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-white opacity-60 transition-all duration-200 ease-out group-hover:scale-110" />
    </button>
  );
});
