import { Injectable } from '@nestjs/common';
import { GameVsComputer } from '../../../../shared/types/game';
import { GameStorage } from './game.storage';

@Injectable()
export class GameInmemoryStorage extends GameStorage {
  private games = new Map<number, GameVsComputer>();

  async save(game: GameVsComputer): Promise<void> {
    this.games.set(game.slot, game);
    return Promise.resolve();
  }

  async findBySlot(slot: number): Promise<GameVsComputer | null> {
    return Promise.resolve(this.games.get(slot) ?? null);
  }

  async deleteBySlot(slot: number): Promise<boolean> {
    return Promise.resolve(this.games.delete(slot));
  }

  async getAll(): Promise<GameVsComputer[]> {
    return Promise.resolve(
      Array.from(this.games.values()).sort((a, b) => a.slot - b.slot),
    );
  }

  async clear(): Promise<void> {
    return Promise.resolve(this.games.clear());
  }
}
