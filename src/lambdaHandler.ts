import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Включаем CORS для Nuxt 3
  app.enableCors({
    origin: 'https://notes-zeta-wheat.vercel.app',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.init();
  const server = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: server });
}

export const handler = async (event: any, context: any, callback: any) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
