import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/schema/user.schema';
import { throwException } from '@src/common/helpers';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  generateToken(user: User): string {
    return this.jwtService.sign({
      id: user['_id'],
      email: user?.email,
      role: user.role
    });
  }

  generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { id: user['_id'] },
      {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: process.env.REFRESH_JWT_EXPIRATION,
      }
    );
  }

  verifyTempToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throwException('Invalid or expired token', 401);
    }
  }

}
