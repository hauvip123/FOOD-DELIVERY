import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    phoneNumber: string

    @IsOptional()
    @IsNumber()
    deliveryFee?: number

    @IsOptional()
    @IsString()
    paymentMethod?: string

    @IsNotEmpty()
    @IsString()
    street: string

    @IsNotEmpty()
    @IsString()
    city: string

    @IsOptional()
    @IsString()
    note?: string
}