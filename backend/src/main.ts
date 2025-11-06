import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Configurar CORS
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
            } else {
                const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Prefijo global
    app.setGlobalPrefix('api', {
        exclude: ['health', ''],
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0'); // 👈 CAMBIO CLAVE

    console.log(`\n🚀 Servidor corriendo en: http://localhost:${port}`);
    console.log(`🌿 API disponible en: http://localhost:${port}/api`);
    console.log(`💚 Health check: http://localhost:${port}/health\n`);
}

bootstrap();
