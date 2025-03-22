import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, ConditionalExpressionOperator, Handler } from 'aws-lambda';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Запуск сервера
  await app.listen(process.env.PORT ?? 4000);
}

export default bootstrap();
