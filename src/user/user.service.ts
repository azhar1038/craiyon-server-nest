import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashService } from './hash.service';
import { randomBytes } from 'crypto';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly hashService: HashService,
  ) {}

  async getUserFromId(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User does not exists');

    return user;
  }

  async getUserFromEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('User does not exists');

    return user;
  }

  async isUserAccountVerified(id: string): Promise<boolean> {
    const user = await this.getUserFromId(id);
    return user.verified;
  }

  async verifyToken(id: string, token: string): Promise<boolean> {
    const user = await this.getUserFromId(id);

    if (token !== user.token || !user.tokenGeneratedAt) return false;
    const timeDiff =
      (new Date().getTime() - user.tokenGeneratedAt.getTime()) / (1000 * 60);
    if (timeDiff > 30) {
      // Token is older than 30 minutes, so not valid
      return false;
    }

    return true;
  }

  async verifyUser(email: string, password: string): Promise<string> {
    let user: User;
    try {
      user = await this.getUserFromEmail(email);
    } catch (err) {
      if (err instanceof NotFoundException) {
        // Hide details from end user
        throw new ForbiddenException('Invalid credentials');
      }
      throw err;
    }

    if (this.hashService.compareHash(password, user.password)) {
      return user.id;
    }

    throw new ForbiddenException('Invalid credentials');
  }

  async addUser(name: string, email: string, password: string): Promise<User> {
    const userExists = await this.userRepository.exist({
      where: {
        email,
      },
    });

    if (userExists) throw new ConflictException('User already exists');

    const hashedPassword = await this.hashService.getHash(password);
    const newUser = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async updateVerificationToken(id: string): Promise<string> {
    const newToken = randomBytes(16).toString('hex');

    await this.userRepository.update(
      { id },
      {
        token: newToken,
        tokenGeneratedAt: new Date(),
      },
    );

    return newToken;
  }

  async verifyUserAccount(
    id: string,
    verificationToken: string,
  ): Promise<void> {
    let verified = false;

    try {
      verified = await this.verifyToken(id, verificationToken);
    } catch (err) {
      if (err instanceof NotFoundException) {
        verified = false;
      } else {
        throw err;
      }
    }

    if (!verified)
      throw new BadRequestException('Failed to verify user account');

    // Everything is okay, mark user as verified
    await this.userRepository.update(
      { id },
      {
        verified: true,
        token: null,
        tokenGeneratedAt: null,
      },
    );
  }

  async resetUserPassword(
    id: string,
    passwordResetToken: string,
    newPassword: string,
  ): Promise<void> {
    let verified = false;

    try {
      verified = await this.verifyToken(id, passwordResetToken);
    } catch (err) {
      if (err instanceof NotFoundException) {
        verified = false;
      } else {
        throw err;
      }
    }

    if (!verified) {
      throw new BadRequestException('Failed to update password');
    }

    // Token is correct, so update the password with hased value
    const hasedPassword = await this.hashService.getHash(newPassword);
    await this.userRepository.update(
      { id },
      {
        token: null,
        tokenGeneratedAt: null,
        password: hasedPassword,
      },
    );

    // Invalidate all existing refresh tokens for user
    await this.refreshTokenRepository.delete({
      user: {
        id,
      },
    });
  }
}
