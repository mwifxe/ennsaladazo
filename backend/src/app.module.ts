import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // 🔍 Log para Render
        console.log(`🧩 DATABASE_URL => ${databaseUrl}`);

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
