import { Module } from '@nestjs/common';
import { GameStorage } from './storage/game.storage';
import { GameServiceBase } from 'src/domain/services/game.service.interface';
import { GameRepository } from './repositories/game.repository';
import { GameInmemoryStorage } from './storage/game.inmemory.storage';
import { GameService } from './services/game.service';

@Module({
  providers: [
    GameRepository,
    { provide: GameStorage, useClass: GameInmemoryStorage },
    { provide: GameServiceBase, useClass: GameService },
  ],
  exports: [GameServiceBase, GameRepository],
})
export class DatasourceModule {}
