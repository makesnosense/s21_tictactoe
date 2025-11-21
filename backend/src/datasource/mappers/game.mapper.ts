import { type Game as DomainGame } from 'src/domain/models/game.model';
import {
  Prisma,
  type Game as PrismaGame,
} from '../../../generated/prisma/client';

export class GameDatasourceMapper {
  static toPrisma(game: DomainGame) {
    return {
      slot: game.slot,
      board: game.board as Prisma.InputJsonValue,
      status: game.status,
      winner: game.winner,
      winningLine: game.winningLine as unknown as Prisma.InputJsonValue,
    } satisfies Prisma.GameUncheckedCreateInput;
  }

  static toDomain(prismaGame: PrismaGame): DomainGame {
    return {
      slot: prismaGame.slot,
      board: prismaGame.board as DomainGame['board'],
      status: prismaGame.status as DomainGame['status'],
      winner: prismaGame.winner as DomainGame['winner'],
      winningLine: prismaGame.winningLine as DomainGame['winningLine'],
    };
  }
}
