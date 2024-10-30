import { Body, Controller, Post, Put, Res, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetCurrentUser } from '@src/common/decorators';
import { generateResponse, throwException } from '@src/common/helpers';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../database/schema/user.schema';
import {
  LoginDTO,
  RegisterDTO,
  SendOtpDTO,
  VerifyOtpDTO,
  RefreshTokenDTO,
  ResetPasswordDTO
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  login(@Res() res: Response, @Body() loginDto: LoginDTO, @GetCurrentUser() user: User) {
    const accessToken = this.authService.generateToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', user.refreshToken, { httpOnly: true });
    generateResponse({ user, accessToken }, 'Logged in successfully', res);
  }

  @Post('/register')
  async register(@Res() res: Response, @Body() registerDto: RegisterDTO) {
    const user = await this.userService.create(registerDto);
    const accessToken = this.authService.generateToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    await this.userService.updateUser(user._id, { refreshToken });
    generateResponse({ user, accessToken, refreshToken }, 'Registered successfully', res);
  }

  @Post('/logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res() res: Response) {

    // Clear tokens from session
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    generateResponse({}, 'Logged out successfully', res);
  }

  @Put('/refresh-token')
  async getRefreshToken(@Res() res: Response, @Body() refreshTokenDto: RefreshTokenDTO) {
    const user = await this.userService.findOne({ refreshToken: refreshTokenDto.refreshToken });
    if (!user) throwException('Invalid refresh token', 400);

    const accessToken = this.authService.generateToken(user);
    const newRefreshToken = this.authService.generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });

    await this.userService.updateUser(user._id, { refreshToken: newRefreshToken });
    return generateResponse({ user, accessToken }, 'Access token generated successfully', res);
  }

  @Post('/send-otp')
  async sendOtp(@Res() res: Response, @Body() sendOtpDto: SendOtpDTO) {
    const { otp, tempToken } = await this.userService.sendOtp(sendOtpDto);
    return generateResponse({ tempToken, otp }, 'OTP sent successfully', res);
  }

  @Put('/verify-otp')
  async verifyOtp(
    @Res() res: Response,
    @Body() verifyOtpDto: VerifyOtpDTO,
    @Headers('Authorization') authorization: string
  ) {
    if (!authorization) throwException('Authorization token is required', 401);
    const tempToken = authorization.replace('Bearer ', '');
    const { userId, email } = this.authService.verifyTempToken(tempToken);

    const verifiedUser = await this.userService.verifyOtp(userId, verifyOtpDto.otp, email);
    return generateResponse({ user: verifiedUser }, 'OTP verified successfully', res);
  }

  @Put('/reset-password')
  async resetPassword(
    @Res() res: Response,
    @Body() resetPasswordDto: ResetPasswordDTO,
    @Headers('Authorization') authHeader: string
  ) {
    if (!authHeader) throwException('Authorization token is required', 400);
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throwException('Passwords do not match', 400);
    }

    const tempToken = authHeader.replace('Bearer ', '');
    const { userId, email, exp } = this.authService.verifyTempToken(tempToken);
    if (Date.now() >= exp * 1000) throwException('Token expired', 401);

    const user = await this.userService.resetPassword(userId, email, resetPasswordDto.password);
    return generateResponse({ user }, 'Password reset successfully', res);
  }
}