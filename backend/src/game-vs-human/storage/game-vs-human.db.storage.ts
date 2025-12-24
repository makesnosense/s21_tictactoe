import { Injectable } from '@nestjs/common';
import { GameVsHumanStorage } from './game-vs-human.storage';
import { GameVsHumanMapper } from '../game-vs-human.mapper';
import { DatabaseService } from 'src/database/database.service';
import {
  GAME_VS_HUMAN_STATUS,
  type GameVsHuman as DomainGameVsHuman,
} from '../../../../shared/types/game-vs-human';
import { LeaderboardEntryDto } from '../dtos/leaderboard.dto';
import { Prisma } from 'generated/prisma/client';

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

  async findCompletedGamesByUserId(
    userId: string,
  ): Promise<DomainGameVsHuman[]> {
    const games = await this.prisma.gameVsHuman.findMany({
      where: {
        status: GAME_VS_HUMAN_STATUS.FINISHED,
        OR: [
          { playerOneId: userId, winner: { not: null } },
          { playerTwoId: userId, winner: { not: null } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return games.map((game) => GameVsHumanMapper.toDomain(game));
  }

  async getLeaderboard(limit: number): Promise<LeaderboardEntryDto[]> {
    const results = await this.prisma.$queryRaw<
      {
        id: string;
        username: string;
        ratio: number;
      }[]
    >`
     WITH users_who_played AS (
             SELECT "playerOneId" AS id
               FROM games_vs_human
              WHERE status = ${GAME_VS_HUMAN_STATUS.FINISHED}
              UNION
             SELECT "playerTwoId" AS id
               FROM games_vs_human
              WHERE status = ${GAME_VS_HUMAN_STATUS.FINISHED}
          ),
          total_games_by_user AS (
             SELECT users_who_played.id,
                    COUNT(*) AS totalGames
               FROM users_who_played
              INNER JOIN games_vs_human ON (
                    users_who_played.id = games_vs_human."playerOneId"
                 OR users_who_played.id = games_vs_human."playerTwoId"
                    )
              WHERE games_vs_human.status = ${GAME_VS_HUMAN_STATUS.FINISHED}
           GROUP BY users_who_played.id
          ),
          games_won_by_user AS (
             SELECT users_who_played.id,
                    COUNT(*) AS gamesWon
               FROM users_who_played
              INNER JOIN games_vs_human ON (
                    users_who_played.id = games_vs_human."playerOneId"
                 OR users_who_played.id = games_vs_human."playerTwoId"
                    )
              WHERE users_who_played.id = games_vs_human."winnerId"
                AND games_vs_human.status = ${GAME_VS_HUMAN_STATUS.FINISHED}
           GROUP BY users_who_played.id
          )
   SELECT total_games_by_user.id,
          users.username,
          ROUND((COALESCE(gamesWon, 0)::FLOAT / totalGames::FLOAT)::NUMERIC, 2) AS ratio
     FROM total_games_by_user
LEFT JOIN games_won_by_user ON total_games_by_user.id = games_won_by_user.id
LEFT JOIN users ON total_games_by_user.id = users.id
 ORDER BY ratio DESC
${limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
  `;

    return results.map((row) => ({
      userId: row.id,
      username: row.username,
      winRatio: Number(row.ratio),
    }));
  }
}
