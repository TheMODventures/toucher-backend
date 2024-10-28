import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDTO {
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
