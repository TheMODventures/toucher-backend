import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/schema/user.schema';

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

  async invalidateToken(user: User) {
    //add logut functionality

  }
}
