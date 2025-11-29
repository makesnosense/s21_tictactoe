import { Injectable } from '@nestjs/common';
import { GameStorage } from './game.storage';
import { GameDatasourceMapper } from '../mappers/game.mapper';
import { DatabaseService } from 'src/database/database.service';
import type { GameVsComputer as domainGame } from '../../../../shared/types/game';
import type { Game as prismaGame } from '../../../generated/prisma/client';

@Injectable()
export class GameDbStorage extends GameStorage {
  constructor(private readonly prisma: DatabaseService) {
    super();
  }
  async save(game: domainGame): Promise<void> {
    const prismaData = GameDatasourceMapper.toPrisma(game);
    await this.prisma.game.upsert({
      where: { slot: prismaData.slot },
      update: prismaData,
      create: prismaData,
    });
  }

  async findBySlot(slot: number): Promise<domainGame | null> {
    const result = await this.prisma.game.findUnique({ where: { slot: slot } });
    return result ? GameDatasourceMapper.toDomain(result) : null;
  }

  async deleteBySlot(slot: number): Promise<boolean> {
    try {
      const deletedGame = await this.prisma.game.delete({ where: { slot } });
      return !!deletedGame;
    } catch (error) {
      console.error(`Delete failed for slot ${slot}:`, error);
      return false;
    }
  }

  async getAll(): Promise<domainGame[]> {
    const games = await this.prisma.game.findMany({ orderBy: { slot: 'asc' } });
    return Promise.resolve(
      games.map((game: prismaGame) => GameDatasourceMapper.toDomain(game)),
    );
  }

  async clear(): Promise<void> {
    await this.prisma.game.deleteMany({});
  }
}
