import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomSaladsService } from './custom-salads.service';
import { CustomSaladsController } from './custom-salads.controller';
import { CustomSalad } from './entities/custom-salad.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([CustomSalad]), UsersModule],
    controllers: [CustomSaladsController],
    providers: [CustomSaladsService],
    exports: [CustomSaladsService],
})
export class CustomSaladsModule {}