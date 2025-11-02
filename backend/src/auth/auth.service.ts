import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthUser } from './entities/auth-user.entity';
import { RegisterDto, LoginDto, LoginResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthUser)
        private readonly authUserRepository: Repository<AuthUser>,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthUser> {
        const { username, email, password } = registerDto;

        // Verificar si el usuario ya existe
        const existingUser = await this.authUserRepository.findOne({
            where: [{ username }, { email }],
        });

        if (existingUser) {
            throw new ConflictException('El usuario o email ya está registrado');
        }

        // Hashear contraseña
        const password_hash = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = this.authUserRepository.create({
            username,
            email,
            password_hash,
        });

        return await this.authUserRepository.save(user);
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { username, password } = loginDto;

        // Buscar usuario por username o email
        const user = await this.authUserRepository.findOne({
            where: [{ username }, { email: username }],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales incorrectas');
        }

        // Generar token simple (en producción usarías JWT)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

        return {
            access_token: token,
            username: user.username,
            email: user.email,
        };
    }

    async findAll(): Promise<AuthUser[]> {
        return await this.authUserRepository.find({
            select: ['id', 'username', 'email', 'is_active', 'created_at'],
        });
    }

    async findOne(id: string): Promise<AuthUser> {
        const user = await this.authUserRepository.findOne({
            where: { id },
            select: ['id', 'username', 'email', 'is_active', 'phone', 'created_at'],
        });

        if (!user) {
            throw new NotFoundException(`Usuario con id ${id} no encontrado`);
        }

        return user;
    }
}