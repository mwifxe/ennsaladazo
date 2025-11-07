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

    // 🌍 CORS: permite Vercel + localhost
    app.enableCors({
    origin: [
        'https://ennsaladazo.vercel.app', // 👈 tu frontend real en Vercel
        'http://localhost:5173',          // para desarrollo local (Vite, por si acaso)
        'http://localhost:3000',          // si usás Nest local
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
