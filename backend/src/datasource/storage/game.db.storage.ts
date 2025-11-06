import { Injectable } from '@nestjs/common';
import { GameStorage } from './game.storage';
import { Game } from 'src/datasource/models/game.model';
import { UUID } from 'crypto';

@Injectable()
export class GameDbStorage extends GameStorage {
  async save(game: Game): Promise<void> {
    throw new Error('DB storage not implemented yet');
  }

  async findById(id: UUID): Promise<Game | null> {
    throw new Error('DB storage not implemented yet');
  }

  deleteById(id: UUID): Promise<boolean> {
    throw new Error('DB storage not implemented yet');
  }

  getAll(): Promise<Game[]> {
    throw new Error('DB storage not implemented yet');
  }

  clear(): void {
    throw new Error('DB storage not implemented yet');
  }
}
