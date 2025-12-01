import {
  Prisma,
  GameVsHuman as PrismaGameVsHuman,
} from '../../generated/prisma/client';
import { CellValue, Board } from '../../../shared/types/board';

import {
  GameVsHuman as DomainGameVsHuman,
  GameVsHuman,
  GameVsHumanStatus,
} from '../../../shared/types/game-vs-human';
import { GameResult } from '../../../shared/types/game';

export class GameVsHumanMapper {
  static toCreatePrisma(
    game: Omit<DomainGameVsHuman, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return {
      board: game.board as Prisma.InputJsonValue,
      status: game.status,
      playerOneId: game.playerOneId,
      playerTwoId: game.playerTwoId,
      playerOneSymbol: game.playerOneSymbol,
      playerTwoSymbol: game.playerTwoSymbol,
      winner: game.winner,
      winnerId: game.winnerId,
      winningLine: game.winningLine as unknown as Prisma.InputJsonValue,
    } satisfies Prisma.GameVsHumanUncheckedCreateInput;
  }

  static toUpdatePrisma(data: Partial<DomainGameVsHuman>) {
    const update: Prisma.GameVsHumanUncheckedUpdateInput = {};

    if (data.board !== undefined)
      update.board = data.board as Prisma.InputJsonValue;
    if (data.status !== undefined) update.status = data.status;
    if (data.playerTwoId !== undefined) update.playerTwoId = data.playerTwoId;
    if (data.winner !== undefined) update.winner = data.winner;
    if (data.winnerId !== undefined) update.winnerId = data.winnerId;
    if (data.winningLine !== undefined) {
      update.winningLine = data.winningLine as unknown as Prisma.InputJsonValue;
    }
    return update;
  }

  static toDomain(prisma: PrismaGameVsHuman): DomainGameVsHuman {
    return {
      id: prisma.id,
      board: prisma.board as Board,
      status: prisma.status as GameVsHumanStatus,
      playerOneId: prisma.playerOneId,
      playerTwoId: prisma.playerTwoId,
      playerOneSymbol: prisma.playerOneSymbol as CellValue,
      playerTwoSymbol: prisma.playerTwoSymbol as CellValue,
      winner: prisma.winner as GameResult,
      winnerId: prisma.winnerId,
      winningLine: prisma.winningLine as GameVsHuman['winningLine'],
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    };
  }
}
