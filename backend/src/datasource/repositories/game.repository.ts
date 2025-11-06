import { Injectable } from '@nestjs/common';
import { GameStorage } from 'src/datasource/storage/game.storage';
import { Game } from 'src/datasource/models/game.model';
import { UUID } from 'crypto';

@Injectable()
export class GameRepository {
  constructor(private readonly storage: GameStorage) {}

  async save(game: Game): Promise<void> {
    return this.storage.save(game);
  }

  async findById(id: UUID): Promise<Game | null> {
    return this.storage.findById(id);
  }

  async deleteById(id: UUID): Promise<boolean> {
    return this.storage.deleteById(id);
  }

  async getAll(): Promise<Game[] | null> {
    return this.storage.getAll();
  }
}
