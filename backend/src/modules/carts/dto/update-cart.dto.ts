import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
