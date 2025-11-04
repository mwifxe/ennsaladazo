import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomSalad } from './entities/custom-salad.entity';
import {
    CreateCustomSaladDto,
    CustomSaladIngredientsDto,
    IngredientOption,
} from './dto/custom-salad.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class CustomSaladsService {
    constructor(
        @InjectRepository(CustomSalad)
        private readonly customSaladRepository: Repository<CustomSalad>,
        private readonly usersService: UsersService,
    ) {}

  async create(createCustomSaladDto: CreateCustomSaladDto): Promise<CustomSalad> {
    const { user_session, ...saladData } = createCustomSaladDto;

    // Obtener o crear usuario
    const user = await this.usersService.findBySessionId(user_session);

    const customSalad = this.customSaladRepository.create({
      ...saladData,
      user_id: user.id,
    });

    // Guardar en la base de datos
    const savedSalad = await this.customSaladRepository.save(customSalad);

    console.log('✅ Ensalada personalizada guardada:', savedSalad);

    return savedSalad;
  }

    async findAll(): Promise<CustomSalad[]> {
        return await this.customSaladRepository.find({
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    async findByUser(user_session: string): Promise<CustomSalad[]> {
        const user = await this.usersService.findBySessionId(user_session);

        return await this.customSaladRepository.find({
            where: { user_id: user.id },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<CustomSalad> {
        const salad = await this.customSaladRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!salad) {
            throw new NotFoundException(`Ensalada personalizada con id ${id} no encontrada`);
        }

        return salad;
    }

    // Obtener ingredientes disponibles
    getAvailableIngredients(): CustomSaladIngredientsDto {
        return {
            bases: [
                { name: 'Lechuga Romana', price: 0, available: true },
                { name: 'Espinaca', price: 0.5, available: true },
                { name: 'Kale', price: 0.75, available: true },
                { name: 'Mix de Lechugas', price: 0.5, available: true },
            ],
            vegetables: [
                { name: 'Tomate', price: 0.3, available: true },
                { name: 'Pepino', price: 0.3, available: true },
                { name: 'Zanahoria', price: 0.25, available: true },
                { name: 'Cebolla Morada', price: 0.2, available: true },
                { name: 'Pimiento', price: 0.4, available: true },
                { name: 'Maíz', price: 0.3, available: true },
                { name: 'Aguacate', price: 1.0, available: true },
                { name: 'Aceitunas', price: 0.5, available: true },
            ],
            proteins: [
                { name: 'Pollo a la Parrilla', price: 1.5, available: true },
                { name: 'Atún', price: 1.25, available: true },
                { name: 'Huevo Duro', price: 0.75, available: true },
                { name: 'Queso Mozzarella', price: 1.0, available: true },
                { name: 'Tocino', price: 1.0, available: true },
                { name: 'Garbanzos', price: 0.75, available: true },
            ],
            dressings: [
                { name: 'César', price: 0, available: true },
                { name: 'Ranch', price: 0, available: true },
                { name: 'Balsámico', price: 0, available: true },
                { name: 'Miel Mostaza', price: 0, available: true },
                { name: 'Vinagreta', price: 0, available: true },
                { name: 'Limón y Aceite', price: 0, available: true },
            ],
            extras: [
                { name: 'Pan Tostado', price: 0.5, available: true },
                { name: 'Queso Parmesano', price: 0.75, available: true },
                { name: 'Nueces', price: 0.75, available: true },
                { name: 'Cranberries', price: 0.5, available: true },
                { name: 'Semillas de Girasol', price: 0.5, available: true },
            ],
        };
    }
}