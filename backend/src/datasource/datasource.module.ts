import { Module } from '@nestjs/common';
import { GameStorage } from './storage/game.storage';
import { GameServiceBase } from 'src/domain/services/game.service.interface';
import { GameRepository } from './repositories/game.repository';
// import { GameInmemoryStorage } from './storage/game.inmemory.storage';
import { GameDbStorage } from './storage/game.db.storage';
import { GameService } from './services/game.service';
import { PrismaService } from './services/prisma.service';

@Module({
  providers: [
    PrismaService,
    GameRepository,
    { provide: GameStorage, useClass: GameDbStorage },
    { provide: GameServiceBase, useClass: GameService },
  ],
  exports: [GameServiceBase, GameRepository],
})
export class DatasourceModule {}
