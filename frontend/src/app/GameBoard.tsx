"use client";
import { Cell } from "./Cell";
import {
  GAME_STATUS,
  type Game,
  type GameResult,
} from "../../../shared/types/game";
import { makeMove } from "@/lib/api";
import { CELL, CellValue } from "../../../shared/types/board";
import { WinningLine } from "./WinningLine";

function getWinnerText(winner: GameResult): string {
  if (winner === "draw") return "draw";
  if (winner === "player wins") return "player wins";
  if (winner === "computer wins") return "computer wins";
  return "";
}

export function GameBoard({ game }: { game: Game }) {
  const handleCellClick = async (idx: number) => {
    if (game.status !== GAME_STATUS.PLAYER_TURN) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    if (game.board[row][col] !== CELL.EMPTY) return;
    // console.log(`Game ${game.slot}, cell [${row}][${col}] clicked`);

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
      <div className="grid cursor-pointer grid-cols-3 gap-px bg-zinc-300 dark:bg-zinc-700">
        {board.map((cell, index) => (
          <Cell
            key={index}
            cellValue={cell}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>

      {game.status === GAME_STATUS.FINISHED && game.winningLine && (
        <WinningLine line={game.winningLine} />
      )}

      {game.status === GAME_STATUS.FINISHED && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 text-nowrap">
          {getWinnerText(game.winner)}
        </div>
      )}
    </div>
  );
}
