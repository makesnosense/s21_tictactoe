"use client";
import { memo } from "react";
import { Cell } from "./Cell";
import {
  GAME_RESULT,
  type GameVsComputer,
  type GameResult,
  GAME_VS_COMPUTER_STATUS,
} from "../../../shared/types/game";
import { makeMove } from "@/lib/api";
import { CELL } from "../../../shared/types/board";
import { WinningLine } from "./WinningLine";
import WaitingDots from "@/components/WaitingDots/WaitingDots";

function getWinnerText(winner: GameResult): string {
  if (winner === "draw") return "draw";
  if (winner === GAME_RESULT.PLAYER_ONE_WINS) return "player wins";
  if (winner === GAME_RESULT.PLAYER_TWO_WINS) return "computer wins";
  return "";
}

export const GameBoard = memo(
  function GameBoard({
    game,
    isBeingRemoved = false,
  }: {
    game: GameVsComputer;
    isBeingRemoved: boolean;
  }) {
    const handleCellClick = async (idx: number) => {
      if (game.status !== GAME_VS_COMPUTER_STATUS.PLAYER_TURN) return;

      const row = Math.floor(idx / 3);
      const col = idx % 3;

      if (game.board[row][col] !== CELL.EMPTY) return;

      const gameWithMove = structuredClone(game);
      gameWithMove.board[row][col] = CELL.PLAYER_ONE;

      try {
        await makeMove(gameWithMove);
      } catch (error) {
        console.error("Move failed:", error);
      }
    };

    const board = game.board.flat();

    return (
      <div
        className={`relative h-[122px] w-[122px] transition-opacity duration-300 ${
          isBeingRemoved ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="grid cursor-pointer grid-cols-3 gap-px rounded-sm bg-white/5 p-px backdrop-blur-sm">
          {board.map((cell, index) => (
            <Cell
              key={index}
              cellValue={cell}
              onClick={() => handleCellClick(index)}
            />
          ))}
        </div>

        {game.status === GAME_VS_COMPUTER_STATUS.FINISHED &&
          game.winningLine && <WinningLine line={game.winningLine} />}

        {game.status === GAME_VS_COMPUTER_STATUS.COMPUTER_TURN && (
          <WaitingDots />
        )}

        {game.status === GAME_VS_COMPUTER_STATUS.FINISHED && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 text-nowrap">
            {getWinnerText(game.winner)}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // return true if props are equal (component should NOT re-render)
    if (prevProps.isBeingRemoved !== nextProps.isBeingRemoved) return false;

    const prevGame = prevProps.game;
    const nextGame = nextProps.game;

    if (prevGame.slot !== nextGame.slot) return false;
    if (prevGame.status !== nextGame.status) return false;
    if (prevGame.winner !== nextGame.winner) return false;

    if (prevGame.board.length !== nextGame.board.length) return false;
    for (let i = 0; i < prevGame.board.length; i++) {
      if (prevGame.board[i].length !== nextGame.board[i].length) return false;
      for (let j = 0; j < prevGame.board[i].length; j++) {
        if (prevGame.board[i][j] !== nextGame.board[i][j]) return false;
      }
    }

    if (
      JSON.stringify(prevGame.winningLine) !==
      JSON.stringify(nextGame.winningLine)
    )
      return false;

    return true; // props are equal, skip re-render
  },
);
