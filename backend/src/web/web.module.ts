import { Module } from '@nestjs/common';
import { GameController } from './controllers/game.controller';
import { DatasourceModule } from 'src/datasource/datasource.module';

@Module({
  imports: [DatasourceModule],
  controllers: [GameController],
  providers: [],
})
export class WebModule {}
