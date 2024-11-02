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

  verifyTempToken(token: string): { userId: string; email: string } {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });

      console.log('Temp token verification:', {
        decoded,
        id: decoded.id,
        email: decoded.email
      });

      return {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      throwException('Invalid or expired token', 401);
    }
  }

}
