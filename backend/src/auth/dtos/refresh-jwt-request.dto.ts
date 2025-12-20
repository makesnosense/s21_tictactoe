import { IsString } from 'class-validator';

export class RefreshJwtRequestDto {
  @IsString()
  refreshToken: string;
}
