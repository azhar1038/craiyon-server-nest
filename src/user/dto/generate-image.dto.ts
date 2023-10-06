import { IsNumber } from 'class-validator';

export class GenerateImageDto {
  @IsNumber()
  readonly page?: number;

  @IsNumber()
  readonly limit?: number;
}
