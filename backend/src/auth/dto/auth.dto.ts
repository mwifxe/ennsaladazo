import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;
}

export class LoginDto {
    @IsString()
    username: string;

    @IsString()
    password: string;
}

export class LoginResponse {
    access_token: string;
    username: string;
    email: string;
}