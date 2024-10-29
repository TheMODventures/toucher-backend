import { HAND, ROLES } from '@src/common/constants';
import { IsDate, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDTO {

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

  @IsEnum(HAND, { message: `Hand must be either ${HAND.LEFT} or ${HAND.RIGHT}` })
  @IsNotEmpty()
  hand: HAND;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  //for role
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;

}
