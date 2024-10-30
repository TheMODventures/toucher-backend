// src/auth/dto/auth.dto.ts
import { IsDateString, IsEnum, IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { HAND, ROLES } from '@src/common/constants';

export class RegisterDTO {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    BowlsClub: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsDateString()
    @IsNotEmpty()
    dob: Date;

    @IsEnum(HAND)
    @IsNotEmpty()
    hand: HAND;

    @IsString()
    @IsNotEmpty()
    fcmToken: string;

    @IsEnum(ROLES)
    @IsNotEmpty()
    role: ROLES;
}

export class LoginDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    fcmToken: string;
}

export class SendOtpDTO {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class VerifyOtpDTO {
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class RefreshTokenDTO {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class ResetPasswordDTO {
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;
}