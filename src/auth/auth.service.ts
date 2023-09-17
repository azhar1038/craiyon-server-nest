import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import configuration from 'src/config/configuration';
import { ConfigType } from '@nestjs/config';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
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

  async createRefreshToken(userId: string, familyId?: string): Promise<string> {
    if (familyId) {
      // A valid request, so remove the previous token
      await this.refreshTokenRepository.delete({ familyId });
    } else {
      familyId = randomUUID();
    }
    const tokenId = randomUUID();
    const refreshToken = sign(
      {
        type: 'Refresh Token',
        familyId,
        tokenId,
        userId,
      },
      this.config.token.refreshSecret,
    );

    const refreshTokenData = this.refreshTokenRepository.create({
      user: {
        id: userId,
      },
      familyId,
      tokenId,
    });

    await this.refreshTokenRepository.save(refreshTokenData);

    return refreshToken;
  }

  async verifyRefreshToken(token: string): Promise<RefreshToken> {
    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, this.config.token.refreshSecret);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token provided');
      }
      throw error;
    }

    const payload = decoded as JwtPayload;
    if (
      !('userId' in payload) ||
      !('tokenId' in payload) ||
      !('familyId' in payload)
    ) {
      throw new UnauthorizedException('Invalid token provided');
    }

    const userId: string = payload.userId;
    const tokenId: string = payload.tokenId;
    const familyId: string = payload.familyId;

    // Refresh token don't expire on there own, so verify from database
    const tokenData = await this.refreshTokenRepository.findOne({
      select: {
        tokenId: true,
        createdAt: true,
        familyId: true,
        user: {
          id: true,
        },
      },
      relations: {
        user: true,
      },
      where: {
        familyId,
      },
    });

    let invalid = false;

    if (!tokenData) {
      throw new UnauthorizedException('Invalid token provided');
    }

    if (tokenData.tokenId !== tokenId || tokenData.user.id !== userId) {
      invalid = true;
    } else {
      const d = new Date();
      const currentTime = d.getTime() + d.getTimezoneOffset() * 60 * 1000;
      const validTill = tokenData.createdAt.getTime() + 1 * 60 * 1000;
      if (validTill < currentTime) {
        invalid = true;
      }
    }

    if (invalid) {
      // Delete tokens belonging to this family and throw error
      await this.refreshTokenRepository.delete({ familyId });
      throw new UnauthorizedException('Invalid token provided');
    }

    return tokenData;
  }
}
