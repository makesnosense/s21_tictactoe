export class LeaderboardEntryDto {
  userId: string;
  username: string;
  winRatio: number;
}

export class GetLeaderboardDto {
  limit: number;
}
