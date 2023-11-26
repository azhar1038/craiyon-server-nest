import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImage } from './entities/generated-image.entity';
import { ImageService } from './image.service';
import { OpenaiService } from './openai.service';
import { CommonModule } from 'src/common/common.module';
import { ImageController } from './image.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneratedImage]),
    CommonModule,
    AuthModule,
    forwardRef(() => UserModule),
  ],
  providers: [ImageService, OpenaiService],
  controllers: [ImageController],
  exports: [ImageService],
})
export class ImageModule {}
