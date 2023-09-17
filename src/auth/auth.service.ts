import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { User } from 'src/user/entities/user.entity';
import configuration from 'src/config/configuration';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(User)
    private readonly user: Repository<User>,
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {}

  createAccessToken(userId: string): string {
    const accessToken = sign(
      { type: 'Access Token', userId },
      this.config.token.accessSecret,
      { expiresIn: '1h' },
    );

    return accessToken;
  }

  verifyAccessToken(token: string): string {
    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, this.config.token.accessSecret);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token provided');
      }
    }

    const payload = decoded as JwtPayload;
    if (!('userId' in payload)) {
      throw new UnauthorizedException('Invalid token provided');
    }

    return payload.userId as string;
  }
}
