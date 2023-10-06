import { IsString } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  readonly email: string;
}
