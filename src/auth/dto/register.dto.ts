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
  @Matches(/^\d*$/, { message: 'Phone number must contain only digits.' })
  @MinLength(7, { message: 'Phone number must be at least 7 digits.' })
  @MaxLength(14, { message: 'Phone number cannot exceed 14 digits.' })
  @IsNotEmpty()
  phone: string;


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
