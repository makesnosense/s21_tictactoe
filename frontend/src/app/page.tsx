import { fetchGames } from "@/lib/api";
import { GamesClient } from "./GamesClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialGames = await fetchGames();

  return <GamesClient initialGames={initialGames} />;
}
