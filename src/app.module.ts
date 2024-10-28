import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserServiceModule } from './user-service/user-service.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, expandVariables: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/api/(.*)'],
    }),
    MulterModule.registerAsync({ useFactory: () => ({ dest: './uploads' }) }),
    DatabaseModule,
    UserModule,
    AuthModule,
    UserServiceModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
