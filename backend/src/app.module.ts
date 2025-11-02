import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        // Configuración de variables de entorno
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Configuración de TypeORM (PostgreSQL)
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
            username: process.env.DB_USERNAME || 'ensaladazo_user',
            password: process.env.DB_PASSWORD || 'yoha2010',
            database: process.env.DB_DATABASE || 'ensaladazo_db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
            logging: process.env.NODE_ENV === 'development',
        }),

        // Módulos de la aplicación
        ProductsModule,
        CartModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}