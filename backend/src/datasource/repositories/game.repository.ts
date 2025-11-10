import { Injectable } from '@nestjs/common';
import { GameStorage } from 'src/datasource/storage/game.storage';
import { Game } from 'src/datasource/models/game.model';

@Injectable()
export class GameRepository {
  constructor(private readonly storage: GameStorage) {}

  async save(game: Game): Promise<void> {
    return this.storage.save(game);
  }

  async findBySlot(slot: number): Promise<Game | null> {
    return this.storage.findBySlot(slot);
  }

  async deleteBySlot(slot: number): Promise<boolean> {
    return this.storage.deleteBySlot(slot);
  }

  async getAll(): Promise<Game[] | null> {
    return this.storage.getAll();
  }
}
