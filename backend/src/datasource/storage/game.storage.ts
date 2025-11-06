import { Game } from 'src/datasource/models/game.model';

export abstract class GameStorage {
  abstract save(game: Game): Promise<void>;
  abstract findById(id: string): Promise<Game | null>;
  abstract deleteById(id: string): Promise<boolean>;
  abstract getAll(): Promise<Game[]>;
  // abstract clear(): void;
}
