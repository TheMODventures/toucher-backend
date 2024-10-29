import { Body, Controller, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetCurrentUser } from '@src/common/decorators';
import { generateResponse, multerStorage, throwException } from '@src/common/helpers';
import { AuthService } from './auth.service';
import { RegisterUserDTO } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { User } from '../database/schema/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  login(@Res() res: Response, @GetCurrentUser() user: User) {

    const accessToken = this.authService.generateToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });
    generateResponse({ user, accessToken }, 'Logged in successfully', res);
  }

  @Post('/register')
  @UseInterceptors(FileInterceptor('image', multerStorage))
  async register(@Res() res: Response, @Body() registerUserDto: RegisterUserDTO, @UploadedFile() file: Express.Multer.File) {

    const user = await this.userService.create(registerUserDto, file);
    const accessToken = this.authService.generateToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Save tokens in session
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    await this.userService.updateUser(user._id, { refreshToken });
    generateResponse({ user, accessToken, refreshToken }, 'Registered successfully', res);
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res() res: Response, @GetCurrentUser() user: User) {

    // Clear tokens from session
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    generateResponse({}, 'Logged out successfully', res);
  }

  @Put('/refresh-token')
  async getRefreshToken(@Res() res: Response, @Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throwException('Refresh token is required', 400);

    const user = await this.userService.findOne({ refreshToken });
    if (!user) throwException('Invalid refresh token', 400);

    const accessToken = this.authService.generateToken(user);
    const newRefreshToken = this.authService.generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });

    await this.userService.updateUser(user._id, { refreshToken: newRefreshToken });
    generateResponse({ user, accessToken }, 'Access token generated successfully', res);
  }

}


