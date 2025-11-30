import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // auto-transform payloads to DTO instances
      whitelist: true, // strip properties not in DTO
      forbidNonWhitelisted: false,
    }),
  );

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    app.enableCors({
      origin: [
        'http://localhost:3001',
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3001$/,
      ],
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
