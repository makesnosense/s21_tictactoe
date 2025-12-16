"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GameVsComputer } from "../../../shared/types/game";
import { GameBoard } from "./GameBoard";
import { BACKEND_BASE_URL, fetchGames, createNewGame } from "@/lib/api";
import { NewGameBoard } from "./NewGameBoard";
import { MAX_SLOTS } from "../../../shared/types/game";

interface GamesClientProps {
  initialGames: GameVsComputer[];
}

export function GamesClient({ initialGames }: GamesClientProps) {
  const [games, setGames] = useState<GameVsComputer[]>(initialGames);
  const [gamesBeingRemoved, setGamesBeingRemoved] = useState<
    Map<number, GameVsComputer>
  >(new Map());

  const gamesRef = useRef(games);
  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let hadError = false;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxAttempts = 10;
    const reconnectDelay = 3000;

    const connect = () => {
      eventSource = new EventSource(`${BACKEND_BASE_URL}/api/games/events`);

      eventSource.onopen = () => {
        if (hadError) {
          console.log("✓ SSE reconnected successfully");
          hadError = false;
          reconnectAttempts = 0;
        }
      };

      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data);

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
        // eventSource.close() sets EventSource.CLOSED, means intentional cleanup, so no error
        if (eventSource?.readyState === EventSource.CLOSED) {
          return;
        }
        console.error("SSE error:", error);
        eventSource?.close();
        hadError = true;

        reconnectAttempts++;
        if (reconnectAttempts <= maxAttempts) {
          console.log(
            `Reconnecting SSE (attempt ${reconnectAttempts}/${maxAttempts}) in ${reconnectDelay}ms...`,
          );
          reconnectTimeout = setTimeout(connect, reconnectDelay);
        } else {
          console.error(
            "Max reconnection attempts reached. Please refresh the page.",
          );
        }
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);

  const handleNewGame = useCallback(async (slot: number) => {
    await createNewGame(slot);
  }, []);

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

  const slots: ({ game: GameVsComputer; isBeingRemoved: boolean } | null)[] =
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
      <div className="grid grid-cols-2 gap-12 p-8 sm:grid-cols-4 sm:gap-12 lg:grid-cols-6 xl:grid-cols-8">
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
