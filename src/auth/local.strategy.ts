import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { UserService } from '@src/user/user.service';
import { throwException } from '@src/common/helpers';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UserService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(req: Request, email: string, password: string) {
    try {
      const { fcmToken } = req.body;
      if (!fcmToken) throwException('fcmToken is required', 422);


      const user = await this.usersService.login({ email, password, fcmToken });
      return user;
    } catch (error) {
      throwException(error.message, 400);
    }
  }
}
