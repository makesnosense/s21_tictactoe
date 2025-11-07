import { Game } from "../../../shared/types/game";
import { GameCard } from "./GameCard";

export default async function HomePage() {
  const response = await fetch("http://localhost:3000/api/games");
  const games = await response.json();
  return (
    <div className="flex gap-3">
      {games.map((game: Game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
