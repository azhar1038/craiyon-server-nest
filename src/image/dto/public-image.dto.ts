import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { OrderBy, SortBy } from 'src/common/enums';

export class PublicImageDto {
  @IsNumber()
  @IsOptional()
  readonly page: number = 0;

  @IsNumber()
  @IsOptional()
  readonly limit: number = 10;

  @IsEnum(SortBy)
  @IsOptional()
  readonly sort: SortBy = SortBy.LIKE;

  @IsEnum(OrderBy)
  @IsOptional()
  readonly order: OrderBy = OrderBy.DESC;
}
