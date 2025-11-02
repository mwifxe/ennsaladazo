import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Habilitar validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Configurar CORS
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:5500',
            'http://127.0.0.1:5500',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Prefijo global para las rutas
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`\nServidor corriendo en: http://localhost:${port}`);
    console.log(`API disponible en: http://localhost:${port}/api`);
    console.log(`Health check: http://localhost:${port}/api/health\n`);
}

bootstrap();