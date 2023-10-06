import { IsString } from 'class-validator';
import { TokenVerificationDto } from './token-verification.dto';

export class NewPasswordDto extends TokenVerificationDto {
  @IsString()
  readonly newPassword: string;
}
