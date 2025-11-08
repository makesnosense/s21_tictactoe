import { Game } from "../../../shared/types/game";

const API_URL = "http://localhost:3000/api";

export async function fetchGames(): Promise<Game[]> {
  const response = await fetch(`${API_URL}/games`);
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  return response.json();
}

export async function createNewGame(): Promise<Game> {
  const response = await fetch(`${API_URL}/games`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  return response.json();
}

export async function makeMove(game: Game): Promise<Game> {
  const response = await fetch(`${API_URL}/games/${game.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
  if (!response.ok) {
    throw new Error(`Failed to make move: ${response.statusText}`);
  }
  return response.json();
}
