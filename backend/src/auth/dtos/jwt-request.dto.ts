import { IsString, MinLength, MaxLength } from 'class-validator';

export class JwtRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  login: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
