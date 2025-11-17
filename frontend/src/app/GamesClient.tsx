"use client";

import { useEffect, useState, useRef } from "react";
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
  const [gamesBeingRemoved, setGamesBeingRemoved] = useState<Map<number, Game>>(
    new Map(),
  );

  const gamesRef = useRef(games);
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    const eventSource = new EventSource(
      "http://localhost:3000/api/games/events",
    );

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE event received:", data);

      if (data.type === "game:deleted") {
        const gameBeingRemoved = gamesRef.current.find(
          (game) => game.slot === data.slot,
        );
        if (!gameBeingRemoved) return;

        // add the game to the cache
        setGamesBeingRemoved((prev) =>
          new Map(prev).set(data.slot, gameBeingRemoved),
        );

        // setting timer that will wait for animation to complete and THEN fetch new games (with no removed game)
        setTimeout(async () => {
          const updatedGames = await fetchGames();
          setGames(updatedGames);

          // remove from cache after animation is complete
          setGamesBeingRemoved((prev) => {
            const next = new Map(prev);
            next.delete(data.slot);
            return next;
          });
        }, 300);
      } else {
        const updatedGames = await fetchGames();
        setGames(updatedGames);
      }
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

  const maxSlotFromGames = games.length > 0 ? games[games.length - 1].slot : -1;
  const maxSlotFromGamesBeingRemoved =
    gamesBeingRemoved.size > 0
      ? Math.max(...Array.from(gamesBeingRemoved.keys()))
      : -1;
  const maxSlotFromBoth = Math.max(
    maxSlotFromGames,
    maxSlotFromGamesBeingRemoved,
  );

  const slotsArrayLength =
    games.length === 0 && gamesBeingRemoved.size === 0
      ? 1
      : Math.min(maxSlotFromBoth + 2, MAX_SLOTS);

  const slots: ({ game: Game; isBeingRemoved: boolean } | null)[] =
    Array(slotsArrayLength).fill(null);

  games.forEach((game) => {
    slots[game.slot] = {
      game,
      isBeingRemoved: false,
    };
  });

  gamesBeingRemoved.forEach((game, slot) => {
    slots[slot] = { game, isBeingRemoved: true };
  });

  return (
    <div className="flex justify-center align-middle">
      <div className="grid grid-cols-2 gap-20 p-8 sm:grid-cols-4 sm:gap-12 lg:grid-cols-6 xl:grid-cols-8">
        {slots.map((slot, index) => {
          if (slot) {
            return (
              <GameBoard
                key={slot.game.slot}
                game={slot.game}
                isBeingRemoved={slot.isBeingRemoved}
              />
            );
          }

          return (
            <NewGameBoard key={index} slot={index} onClick={handleNewGame} />
          );
        })}
      </div>
    </div>
  );
}
