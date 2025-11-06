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

  async deleteById(id: UUID): Promise<boolean> {
    return Promise.resolve(this.games.delete(id));
  }

  async getAll(): Promise<Game[]> {
    return Promise.resolve(Array.from(this.games.values()));
  }

  // clear(): void {
  //   this.games.clear();
  // }
}
