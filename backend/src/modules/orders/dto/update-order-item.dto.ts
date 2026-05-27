import { IsNotEmpty, IsString } from "class-validator";

export class UpdateOrderItemDto {
    @IsNotEmpty()
    @IsString()
    orderStatus: string
}