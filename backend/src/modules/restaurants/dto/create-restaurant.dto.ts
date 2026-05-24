import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRestaurantDto {
    @IsNotEmpty()
    @IsNumber()
    ownerId: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    city: string;


    @IsNotEmpty()
    @IsString()
    cuisine: string;

    @IsOptional()
    @IsString()
    imgage?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty()
    @IsString()
    openTime: string;

    @IsNotEmpty()
    @IsString()
    closeTime: string;

    @IsOptional()
    @IsBoolean()
    isOpen?: boolean;

    @IsOptional()
    @IsNumber()
    ratingAverage?: number;
}