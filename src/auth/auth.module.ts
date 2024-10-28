import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '@src/user/user.module';

@Module({
  imports: [
    PassportModule,
    UserModule,
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1y' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [],
})
export class AuthModule { }
