import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';

@Module({
  controllers: [GameController]
})
export class WebModule {}
