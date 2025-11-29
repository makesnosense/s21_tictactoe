import { GameVsComputer } from '../../../../shared/types/game';

export abstract class GameStorage {
  abstract save(game: GameVsComputer): Promise<void>;
  abstract findBySlot(slot: number): Promise<GameVsComputer | null>;
  abstract deleteBySlot(slot: number): Promise<boolean>;
  abstract getAll(): Promise<GameVsComputer[]>;
  abstract clear(): Promise<void>;
}
