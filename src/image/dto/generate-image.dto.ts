import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  GeneratorModel,
  ImageResolution,
} from '../entities/generated-image.entity';

export class GenerateImageDto {
  @IsString()
  readonly prompt: string;

  @IsEnum(GeneratorModel)
  @IsOptional()
  readonly model: GeneratorModel = GeneratorModel.DALLE;

  @IsEnum(ImageResolution)
  @IsOptional()
  readonly resolution: ImageResolution = ImageResolution.RES_256X256;
}
