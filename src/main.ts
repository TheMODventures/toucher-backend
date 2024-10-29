import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorLoggingFilter } from './common/exception-filters/error-logging.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

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
