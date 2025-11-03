import { Module } from '@nestjs/common';
import { GameRepository } from './repositories/game.repository';
import { GameInmemoryStorage } from './storage/game.inmemory.storage';
// import { GameDbStorage } from './storage/game.db.storage';
import { GameService } from './services/game.service';

@Module({
  providers: [GameRepository, GameInmemoryStorage, GameService],
})
export class DatasourceModule {}
