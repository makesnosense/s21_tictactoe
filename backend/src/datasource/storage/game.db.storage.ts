import { Injectable } from '@nestjs/common';
import { GameStorage } from './game.storage';
import { Game } from 'src/datasource/models/game.model';

@Injectable()
export class GameDbStorage extends GameStorage {
  async save(game: Game): Promise<void> {
    throw new Error('DB storage not implemented yet');
  }

  async findBySlot(slot: number): Promise<Game | null> {
    throw new Error('DB storage not implemented yet');
  }

  deleteBySlot(slot: number): Promise<boolean> {
    throw new Error('DB storage not implemented yet');
  }

  getAll(): Promise<Game[]> {
    throw new Error('DB storage not implemented yet');
  }

  clear(): void {
    throw new Error('DB storage not implemented yet');
  }
}
