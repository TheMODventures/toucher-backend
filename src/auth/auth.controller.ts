import { Body, Controller, Post, Put, Res, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
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
import { Public } from '@src/middleware/auth.decorator';
import { TokenPayload } from '@src/common/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Public()
  @Post('/login')
  async login(@Res() res: Response, @Body() loginDto: LoginDTO) {
    try {
      const user = await this.userService.findOne({ email: loginDto.email });
      console.log('User found during login:', user); // Debug log

      if (!user || !user._id) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Ensure we have a string ID
      const userId = user._id.toString();
      const payload: TokenPayload = {
        userId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
      console.log('Token payload:', payload);

      const accessToken = await this.authService.generateToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user);
      const updatedUser = await this.userService.updateUser(user._id, { accessToken, refreshToken });

      generateResponse({ updatedUser }, 'Logged in successfully', res);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  @Public()
  @Post('/register')
  async register(@Res() res: Response, @Body() registerDto: RegisterDTO) {
    const user = await this.userService.create(registerDto);
    const accessToken = this.authService.generateToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    await this.userService.updateUser(user._id, { refreshToken, accessToken });
    generateResponse({ user, accessToken, refreshToken }, 'Registered successfully', res);
  }

  @Post('/logout')
  async logout(@Res() res: Response, @GetCurrentUser() user: User) {

    await this.userService.updateUser(user._id, { refreshToken: null, accessToken: null });
    generateResponse({}, 'Logged out successfully', res);
  }

  @Public()
  @Put('/refresh-token')
  async getRefreshToken(@Res() res: Response, @Body() refreshTokenDto: RefreshTokenDTO) {
    const user = await this.userService.findOne({ refreshToken: refreshTokenDto.refreshToken });
    if (!user) throwException('Invalid refresh token', 400);

    const accessToken = this.authService.generateToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    const updatedUser = await this.userService.updateUser(user._id, { accessToken, refreshToken });

    return generateResponse({ updatedUser }, 'Access token generated successfully', res);
  }

  @Public()
  @Post('/send-otp')
  async sendOtp(@Res() res: Response, @Body() sendOtpDto: SendOtpDTO) {
    const { otp, tempToken } = await this.userService.sendOtp(sendOtpDto);
    return generateResponse({ tempToken, otp }, 'OTP sent successfully', res);
  }

  @Public()
  @Put('/verify-otp')
  async verifyOtp(
    @Res() res: Response,
    @Body() verifyOtpDto: VerifyOtpDTO,
    @Headers('Authorization') authorization: string
  ) {
    if (!authorization) throwException('Authorization token is required', 401);

    const tempToken = authorization.replace('Bearer ', '');
    const { userId, email } = this.authService.verifyTempToken(tempToken);
    console.log('Decoded from temp token:', { userId, email });

    const verifiedUser = await this.userService.verifyOtp(userId, verifyOtpDto.otp, email);
    return generateResponse({ user: verifiedUser }, 'OTP verified successfully', res);
  }

  @Public()
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
    const { userId, email } = this.authService.verifyTempToken(tempToken);
    // if (Date.now() >= exp * 1000) throwException('Token expired', 401);

    const user = await this.userService.resetPassword(userId, email, resetPasswordDto.password);
    return generateResponse({ user }, 'Password reset successfully', res);
  }
}