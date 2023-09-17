import { IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly email: string;

  @IsString()
  @IsStrongPassword()
  readonly password: string;
}
