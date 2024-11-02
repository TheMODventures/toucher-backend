import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
  // @IsOptional()
  // @IsString()
  // @IsNotEmpty()
  // username: string;

  // @IsOptional()
  // @Length(6, 20)
  // password: string;

  @IsOptional()
  refreshToken: string;

  @IsOptional()
  accessToken: string;
}
