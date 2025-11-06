import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Carga global de variables de entorno (.env o Render Env Vars)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuración dinámica de TypeORM con soporte para Render
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // 👈 Render env var
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false, // 👈 Render exige SSL
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
