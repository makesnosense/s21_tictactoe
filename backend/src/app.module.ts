import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameVsHumanModule } from './game-vs-human/game-vs-human.module';

@Module({
  imports: [
    GameModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    GameVsHumanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
