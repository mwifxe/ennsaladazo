import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return await this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            relations: ['cart_items'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['cart_items'],
        });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }

    async findBySessionId(session_id: string): Promise<User> {
        let user = await this.userRepository.findOne({
            where: { session_id },
            relations: ['cart_items'],
        });

        if (!user) {
            // Crear usuario si no existe
            user = await this.create({ session_id });
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
}