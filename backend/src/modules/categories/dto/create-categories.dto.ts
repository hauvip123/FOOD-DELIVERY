import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoriesDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    restaurantId: number;

    @IsNotEmpty()
    @IsString()
    name: string;
}
