import { Injectable } from '@nestjs/common';
import { GameVsHumanStorage } from './game-vs-human.storage';
import { GameVsHumanMapper } from '../game-vs-human.mapper';
import { DatabaseService } from 'src/database/database.service';
import {
  GAME_VS_HUMAN_STATUS,
  type GameVsHuman as DomainGameVsHuman,
} from '../../../../shared/types/game-vs-human';

@Injectable()
export class GameVsHumanDbStorage extends GameVsHumanStorage {
  constructor(private readonly prisma: DatabaseService) {
    super();
  }

  async create(
    game: Omit<DomainGameVsHuman, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DomainGameVsHuman> {
    const prismaData = GameVsHumanMapper.toCreatePrisma(game);
    const created = await this.prisma.gameVsHuman.create({ data: prismaData });
    return GameVsHumanMapper.toDomain(created);
  }

  async findById(id: string): Promise<DomainGameVsHuman | null> {
    const result = await this.prisma.gameVsHuman.findUnique({ where: { id } });
    return result ? GameVsHumanMapper.toDomain(result) : null;
  }

  async update(
    id: string,
    data: Partial<DomainGameVsHuman>,
  ): Promise<DomainGameVsHuman> {
    const prismaData = GameVsHumanMapper.toUpdatePrisma(data);
    const updated = await this.prisma.gameVsHuman.update({
      where: { id },
      data: prismaData,
    });
    return GameVsHumanMapper.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.gameVsHuman.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findAvailableGames(): Promise<DomainGameVsHuman[]> {
    const games = await this.prisma.gameVsHuman.findMany({
      where: { status: GAME_VS_HUMAN_STATUS.WAITING_FOR_OPPONENT },
      orderBy: { createdAt: 'desc' },
    });
    return games.map((game) => GameVsHumanMapper.toDomain(game));
  }

  async findActiveGameByUserId(
    userId: string,
  ): Promise<DomainGameVsHuman | null> {
    const result = await this.prisma.gameVsHuman.findFirst({
      where: {
        status: { not: GAME_VS_HUMAN_STATUS.FINISHED },
        OR: [{ playerOneId: userId }, { playerTwoId: userId }],
      },
    });
    return result ? GameVsHumanMapper.toDomain(result) : null;
  }
}
