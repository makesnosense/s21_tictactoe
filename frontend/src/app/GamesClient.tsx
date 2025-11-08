"use client";

import { useEffect, useState } from "react";
import { Game } from "../../../shared/types/game";
import { GameCard } from "./GameCard";
import { fetchGames, createNewGame } from "@/lib/api";

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

  const handleNewGame = async () => {
    await createNewGame();
  };

  return (
    <div>
      <button
        onClick={handleNewGame}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        New Game
      </button>

      <div className="flex flex-wrap gap-3">
        {games.map((game: Game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
