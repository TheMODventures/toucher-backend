import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorLoggingFilter } from './common/exception-filters/error-logging.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './middleware/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Enable CORS to allow all origins
  app.enableCors();

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Removes properties that should not be received
    forbidNonWhitelisted: true, // Throws an error for any properties that aren't allowed
    transform: true, // Automatically transforms payloads to the expected types
    errorHttpStatusCode: 422, // Optional: change the HTTP status code to Unprocessable Entity (default is 400)
  }));

  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const userService = app.get(UserService);
  const authService = app.get(AuthService);

  app.useGlobalGuards(
    new AuthGuard(reflector, jwtService, userService, authService)
  );

  // Register the global validation exception filter
  app.useGlobalFilters(new ErrorLoggingFilter());

  // Register the global prefix
  app.setGlobalPrefix('api');

  // Load the PORT from the .env file
  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);
  console.log(`Server is running on port ${PORT}`);
}
bootstrap();
