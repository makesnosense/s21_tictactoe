import { Module } from '@nestjs/common';
import { GameRepository } from './repositories/game.repository';
import { GameInmemoryStorage } from './storage/game.inmemory.storage';
// import { GameDbStorage } from './storage/game.db.storage';

@Module({
  providers: [GameRepository, GameInmemoryStorage],
})
export class DatasourceModule {}
