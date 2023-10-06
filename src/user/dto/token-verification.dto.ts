import { IsString } from 'class-validator';

export class TokenVerificationDto {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly token: string;
}
