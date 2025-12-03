import { Module } from '@nestjs/common';
import { GameVsHumanController } from './game-vs-human.controller';
import { GameVsHumanService } from './game-vs-human.service';
import { GameVsHumanStorage } from './storage/game-vs-human.storage';
import { GameVsHumanDbStorage } from './storage/game-vs-human.db.storage';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GameVsHumanController],
  providers: [
    { provide: GameVsHumanStorage, useClass: GameVsHumanDbStorage },
    GameVsHumanService,
  ],
  exports: [GameVsHumanService],
})
export class GameVsHumanModule {}
