import { IsNumber, IsOptional } from 'class-validator';

export class GenerateImageDto {
  @IsNumber()
  @IsOptional()
  readonly page: number = 0;

  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;
}
