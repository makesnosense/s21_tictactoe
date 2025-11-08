"use client";
import { Cell } from "./Cell";
import type { Game } from "../../../shared/types/game";
import { makeMove } from "@/lib/api";
import { CELL } from "../../../shared/types/board";

export function GameCard({ game }: { game: Game }) {
  const handleCellClick = (idx: number) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;

    console.log(`Game ${game.id}, cell [${row}][${col}] clicked`);

    const gameWithMove = structuredClone(game);
    gameWithMove.board[row][col] = CELL.PLAYER;

    makeMove(gameWithMove);
  };

  const board = game.board.flat();

  return (
    <div className="grid grid-cols-3 gap-px bg-zinc-300 dark:bg-zinc-700">
      {board.map((cell, index) => (
        <Cell key={index} cell={cell} onClick={() => handleCellClick(index)} /> // Cells never change their indexes
      ))}
    </div>
  );
}
