import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReplaceCartItemDto {
  @IsInt()
  @IsPositive()
  dishId: number;

  @IsInt()
  @IsPositive()
  restaurantId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class ReplaceCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplaceCartItemDto)
  items: ReplaceCartItemDto[];
}
