import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { MailService } from 'src/common/services/mail/mail.service';
import { ImageService } from 'src/image/image.service';
import { Request } from 'express';
import { GenerateImageDto } from './dto/generate-image.dto';
import { TokenVerificationDto } from './dto/token-verification.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { NewPasswordDto } from './dto/new-password.dto';
import configuration from 'src/config/configuration';
import { ConfigType } from '@nestjs/config';
import { User } from './entities/user.entity';
import { PasswordResetDto } from './dto/password-reset.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly imageService: ImageService,
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUserDetails(@Req() req: Request) {
    const userId: string = req['userId'];
    return await this.userService.getUserFromId(userId);
  }

  @Get('generated-images')
  @UseGuards(AuthGuard)
  async getImages(@Req() req: Request, @Query() body: GenerateImageDto) {
    const userId: string = req['userId'];
    const page = body.page;
    const limit = body.limit;

    const images = await this.imageService.getUserGeneratedImages(
      userId,
      limit,
      page,
    );

    return images;
  }

  private async verifyAccount(userId: string, token: string) {
    await this.userService.verifyUserAccount(userId, token);
    return {
      message: 'User verified',
    };
  }

  @Get('verify-account/:userId/:token')
  async verifyAccountGet(@Param() param: TokenVerificationDto) {
    return await this.verifyAccount(param.userId, param.token);
  }

  @Patch('password-reset')
  async resetPassword(@Body() body: NewPasswordDto) {
    const userId = body.userId;
    const token = body.token;
    const newPassword = body.newPassword;

    await this.userService.resetUserPassword(userId, token, newPassword);

    return {
      message: 'Password has been reset',
    };
  }

  @Patch('mail/verify-account')
  @UseGuards(AuthGuard)
  async generateNewVerificationToken(@Req() req: Request) {
    const userId: string = req['userId'];

    const user: User = await this.userService.getUserFromId(userId);
    const newToken = await this.userService.updateVerificationToken(userId);
    const handleUrl = `${this.config.domain}/user/verify-account/${userId}/${newToken}`;
    this.mailService.sendAccoutVerificationMail(user.email, handleUrl);

    return {
      message: 'Sent account verification mail',
    };
  }

  @Patch('mail/password-reset')
  async sendPasswordResetMail(@Body() body: PasswordResetDto) {
    const email = body.email;

    const user: User = await this.userService.getUserFromEmail(email);
    const newToken = await this.userService.updateVerificationToken(user.id);
    const handleUrl = `${this.config.domain}/api/v1/user/verify-password-reset-token/${user.id}/${newToken}`;
    this.mailService.sendPasswordResetMail(email, handleUrl);

    return {
      message: 'Sent password reset mail',
    };
  }
}
