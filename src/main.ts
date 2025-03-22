import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send();
    } else {
      next();
    }
  });

  // Если не в сервере Lambda, запускаем приложение на локальном хосте
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(process.env.PORT ?? 4000);
    console.log(
      `Application is running on: http://localhost:${process.env.PORT ?? 4000}`,
    );
    return;
  }

  // Для Lambda-режима возвращаем serverless-express
  await app.init();
  const server = app.getHttpAdapter().getInstance();
  server.options('*', (req, res) => {
    res.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send();
  });
  return serverlessExpress({ app: server });
}

// Если мы находимся в сервере Lambda, экспортируем handler
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  const server = await bootstrap();
  return server(event, context, callback);
};

// Локально экспортируем функцию, чтобы она запускала приложение
if (process.env.NODE_ENV !== 'production') {
  bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


