"use client";

import { useEffect, useState } from "react";
import { Game } from "../../../shared/types/game";
import { GameBoard } from "./GameBoard";
import { fetchGames, createNewGame } from "@/lib/api";
import { NewGameBoard } from "./NewGameBoard";
import { MAX_SLOTS } from "../../../shared/types/game";

interface GamesClientProps {
  initialGames: Game[];
}

export function GamesClient({ initialGames }: GamesClientProps) {
  const [games, setGames] = useState<Game[]>(initialGames);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:3000/api/games/events",
    );

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE event received:", data);
      const updatedGames = await fetchGames();
      setGames(updatedGames);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleNewGame = async (slot: number) => {
    await createNewGame(slot);
  };

  const slotsArrayLength = games.length
    ? Math.min(games[games.length - 1].slot + 2, MAX_SLOTS)
    : 1;

  const slots: (Game | null)[] = Array(slotsArrayLength).fill(null);

  games.forEach((game) => {
    slots[game.slot] = game;
  });

  return (
    <div className="flex flex-wrap gap-8 p-6">
      {slots.map((game, slot) => {
        if (game) {
          return <GameBoard key={game.slot} game={game} />;
        }

        return <NewGameBoard key={slot} slot={slot} onClick={handleNewGame} />;
      })}
    </div>
  );
}
