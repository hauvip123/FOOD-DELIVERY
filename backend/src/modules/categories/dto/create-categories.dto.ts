import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCategoriesDto {
    @IsNotEmpty()
    @IsNumber()
    restaurantsId: number;

    @IsNotEmpty()
    @IsString()
    name: string;
}