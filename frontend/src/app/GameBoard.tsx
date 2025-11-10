"use client";
import { Cell } from "./Cell";
import type { Game, GameResult } from "../../../shared/types/game";
import { makeMove } from "@/lib/api";
import { CELL } from "../../../shared/types/board";

function getWinnerText(winner: GameResult): string {
  if (winner === "draw") return "Draw!";
  if (winner === "player wins") return "Player wins!";
  if (winner === "computer wins") return "Computer wins!";
  return "";
}

export function GameBoard({ game }: { game: Game }) {
  const handleCellClick = async (idx: number) => {
    if (game.isGameOver) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    console.log(`Game ${game.slot}, cell [${row}][${col}] clicked`);

    const gameWithMove = structuredClone(game);
    gameWithMove.board[row][col] = CELL.PLAYER;

    try {
      await makeMove(gameWithMove);
    } catch (error) {
      console.error("Move failed:", error);
    }
  };

  const board = game.board.flat();
  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-px bg-zinc-300 dark:bg-zinc-700">
        {board.map((cell, index) => (
          <Cell
            key={index}
            cell={cell}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>

      {game.isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white px-6 py-4 text-center shadow-xl dark:bg-zinc-900">
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {getWinnerText(game.winner)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
