import { Module } from '@nestjs/common';
import { GameStorage } from './storage/game.storage';
// import { GameInmemoryStorage } from './storage/game.inmemory.storage';
import { GameDbStorage } from './storage/game.db.storage';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  controllers: [GameController],
  providers: [{ provide: GameStorage, useClass: GameDbStorage }, GameService],
})
export class GameModule {}
