import { Module, forwardRef } from '@nestjs/common';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HashService } from './hash.service';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    forwardRef(() => AuthModule),
    CommonModule,
    forwardRef(() => ImageModule),
  ],
  controllers: [UserController],
  providers: [UserService, HashService],
  exports: [UserService],
})
export class UserModule {}
