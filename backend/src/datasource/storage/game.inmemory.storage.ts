import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Game } from 'src/datasource/models/game.model';
import { GameStorage } from './game.storage';

@Injectable()
export class GameInmemoryStorage extends GameStorage {
  private games = new Map<UUID, Game>();

  async save(game: Game): Promise<void> {
    this.games.set(game.id, game);
    return Promise.resolve();
  }

  async findById(id: UUID): Promise<Game | null> {
    return Promise.resolve(this.games.get(id) ?? null);
  }

  deleteById(id: UUID): boolean {
    return this.games.delete(id);
  }

  getAll(): Game[] {
    return Array.from(this.games.values());
  }

  clear(): void {
    this.games.clear();
  }
}
