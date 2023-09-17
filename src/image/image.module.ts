import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImage } from './entities/generated-image.entity';
import { ImageService } from './image.service';
import { OpenaiService } from './openai.service';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedImage])],
  providers: [ImageService, OpenaiService],
})
export class ImageModule {}
