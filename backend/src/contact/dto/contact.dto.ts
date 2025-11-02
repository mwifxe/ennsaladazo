import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateContactMessageDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(1000)
    message: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;
}