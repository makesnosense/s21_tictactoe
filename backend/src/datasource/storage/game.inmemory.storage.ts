import { Injectable } from '@nestjs/common';
import { Game } from 'src/datasource/models/game.model';
import { GameStorage } from './game.storage';

@Injectable()
export class GameInmemoryStorage extends GameStorage {
  private games = new Map<number, Game>();

  async save(game: Game): Promise<void> {
    this.games.set(game.slot, game);
    return Promise.resolve();
  }

  async findBySlot(slot: number): Promise<Game | null> {
    return Promise.resolve(this.games.get(slot) ?? null);
  }

  async deleteBySlot(slot: number): Promise<boolean> {
    return Promise.resolve(this.games.delete(slot));
  }

  async getAll(): Promise<Game[]> {
    return Promise.resolve(
      Array.from(this.games.values()).sort((a, b) => a.slot - b.slot),
    );
  }

  async clear(): Promise<void> {
    return Promise.resolve(this.games.clear());
  }
}
