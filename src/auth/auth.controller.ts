import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from 'src/user/user.service';
import configuration from 'src/config/configuration';
import { ConfigType } from '@nestjs/config';
import { MailService } from 'src/common/services/mail/mail.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
  ) {}

  private async generateTokenResponse(userId: string, tokenFamilyId?: string) {
    const accessToken = this.authService.createAccessToken(userId);
    const refreshToken = await this.authService.createRefreshToken(
      userId,
      tokenFamilyId,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('/register')
  async register(@Body() user: RegisterUserDto) {
    const addedUser = await this.userService.addUser(
      user.name,
      user.email,
      user.password,
    );

    const verificationToken = await this.userService.updateVerificationToken(
      addedUser.id,
    );
    const verificationUrl = `${this.config.domain}/user/verify/${addedUser.id}/${verificationToken}`;
    this.mailService.sendAccoutVerificationMail(user.email, verificationUrl);

    return await this.generateTokenResponse(addedUser.id);
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const userId = await this.userService.verifyUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    return await this.generateTokenResponse(userId);
  }

  @Post('/refresh-token')
  async refreshToken(@Headers('Authorization') authorization: string) {
    const refreshToken = authorization?.replace('Bearer ', '');

    if (!refreshToken)
      throw new UnauthorizedException('Invalid token provided');

    const refreshTokenData = await this.authService.verifyRefreshToken(
      refreshToken,
    );

    return await this.generateTokenResponse(
      refreshTokenData.user.id,
      refreshTokenData.familyId,
    );
  }
}
