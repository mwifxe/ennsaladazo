import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 🔧 Carga global de variables de entorno (.env o Render Env Vars)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ⚡ Conexión dinámica con la base de datos PostgreSQL de Render
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        console.log('🧩 DATABASE_URL =>', databaseUrl); // <- debug temporal

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: true,
          extra: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
