import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @Length(6, 20)
  password: string;
}
