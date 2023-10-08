import { IsString } from 'class-validator';

export class ImageDto {
  @IsString()
  readonly imageId: string;
}
