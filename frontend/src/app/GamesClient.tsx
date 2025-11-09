"use client";

import { useEffect, useState } from "react";
import { Game } from "../../../shared/types/game";
import { GameBoard } from "./GameBoard";
import { fetchGames, createNewGame } from "@/lib/api";
import { NewGameBoard } from "./NewGameBoard";

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
      <div className="flex flex-wrap gap-8 p-6">
        {games.map((game: Game) => (
          <GameBoard key={game.id} game={game} />
        ))}

        <NewGameBoard onClick={handleNewGame} />
      </div>
    </div>
  );
}
