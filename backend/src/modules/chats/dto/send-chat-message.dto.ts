import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendChatMessageDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    content: string;
}
