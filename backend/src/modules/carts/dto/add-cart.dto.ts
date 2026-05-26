import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class AddCartDto {
  @IsInt()
  @IsPositive()
  dishId: number;

  @IsInt()
  @IsPositive()
  userId: number;

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
