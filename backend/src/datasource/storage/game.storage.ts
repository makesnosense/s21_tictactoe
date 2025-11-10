import { Game } from 'src/datasource/models/game.model';

export abstract class GameStorage {
  abstract save(game: Game): Promise<void>;
  abstract findBySlot(slot: number): Promise<Game | null>;
  abstract deleteBySlot(slot: number): Promise<boolean>;
  abstract getAll(): Promise<Game[]>;
  // abstract clear(): void;
}
