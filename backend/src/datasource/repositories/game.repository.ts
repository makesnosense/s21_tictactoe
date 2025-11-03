import { Injectable } from '@nestjs/common';
import { GameStorage } from 'src/datasource/storage/game.storage';
import { Game } from 'src/datasource/models/game.model';

@Injectable()
export class GameRepository {
  constructor(private readonly storage: GameStorage) {}

  async save(game: Game): Promise<void> {
    return this.storage.save(game);
  }

  async findById(id: string): Promise<Game | null> {
    return this.storage.findById(id);
  }
}
