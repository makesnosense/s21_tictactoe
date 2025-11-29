import { GameVsComputer } from "../../../shared/types/game";

const getBackendBaseUrl = () => {
  if (typeof window !== "undefined") {
    // browser
    // env set by next start
    if (process.env.NODE_ENV === "production") {
      return ""; // relative URL through nginx
    }

    // development: use same host as frontend
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3000`;
  }
  // server-side
  return process.env.NODE_ENV === "production"
    ? "http://backend:3000"
    : "http://localhost:3000";
};

export const BACKEND_BASE_URL = getBackendBaseUrl();

export async function fetchGames(): Promise<GameVsComputer[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/games`);
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  return response.json();
}

export async function createNewGame(slot: number): Promise<GameVsComputer> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  return response.json();
}

export async function makeMove(game: GameVsComputer): Promise<GameVsComputer> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/games/${game.slot}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  if (!response.ok) {
    throw new Error(`Failed to make move: ${response.statusText}`);
  }
  return response.json();
}
