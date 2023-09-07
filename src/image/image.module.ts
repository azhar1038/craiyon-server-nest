import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedImage } from './entities/generated-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedImage])],
})
export class ImageModule {}
