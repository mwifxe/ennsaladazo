import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { ContactModule } from './contact/contact.module';
import { CustomSaladsModule } from './custom-salads/custom-salads.module';
import { UsersModule } from './users/users.module';

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
    ProductsModule,
    AuthModule,
    CartModule,
    ContactModule,
    CustomSaladsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
