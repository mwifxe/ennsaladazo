import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🌿 Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 🌍 CORS (Render + local)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
        if (allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 🚦 Prefijo global
  app.setGlobalPrefix('api', { exclude: ['health', ''] });

  // 🔥 Puerto dinámico: Render usa process.env.PORT (default 10000)
  const port = process.env.PORT || 10000;

  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 Servidor corriendo en: http://0.0.0.0:${port}`);
  console.log(`🌿 API disponible en: http://0.0.0.0:${port}/api`);
  console.log(`💚 Health check: http://0.0.0.0:${port}/health\n`);
}

bootstrap();
