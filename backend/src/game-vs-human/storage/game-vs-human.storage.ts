import { GameVsHuman } from '../../../../shared/types/game-vs-human';

export abstract class GameVsHumanStorage {
  abstract create(
    game: Omit<GameVsHuman, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<GameVsHuman>;
  abstract findById(id: string): Promise<GameVsHuman | null>;
  abstract update(id: string, data: Partial<GameVsHuman>): Promise<GameVsHuman>;
  abstract delete(id: string): Promise<boolean>;
  abstract findAvailableGames(): Promise<GameVsHuman[]>;
  abstract findActiveGameByUserId(userId: string): Promise<GameVsHuman | null>;
}
