import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDTO {
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
  phone: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
