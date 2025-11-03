import { Injectable } from '@nestjs/common';
import { GameStorage } from './game.storage';
import { Game } from 'src/datasource/models/game.model';
import { UUID } from 'crypto';

@Injectable()
export class GameDbStorage extends GameStorage {
  save(game: Game): Promise<void> {
    throw new Error('DB storage not implemented yet');
  }

  findById(id: UUID): Game | undefined {
    throw new Error('DB storage not implemented yet');
  }

  deleteById(id: UUID): boolean {
    throw new Error('DB storage not implemented yet');
  }

  getAll(): Game[] {
    throw new Error('DB storage not implemented yet');
  }

  clear(): void {
    throw new Error('DB storage not implemented yet');
  }
}
