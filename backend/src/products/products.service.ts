import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find({
            where: { is_available: true },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return product;
    }

    async findByCategory(category: string): Promise<Product[]> {
        return await this.productRepository.find({
            where: { category, is_available: true },
            order: { created_at: 'DESC' },
        });
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

    async seedProducts(): Promise<Product[]> {
        const productsData = [
            // Ensaladas principales
            {
                name: 'Ensalada CobbFit',
                description:
                    'Mezcla fresca de lechuga, tomate, cebolla morada, aguacate, queso mozarella, tocino, pechuga de pollo, huevo duro, y rodajas de pan tostado.',
                price: 4.0,
                category: 'ensaladas',
                is_available: true,
                stock: 50,
            },
            {
                name: 'Ensalada César',
                description:
                    'Una ensalada a base de lechuga, pechuga de pollo, huevo duro, tomate, queso mozarella y rodajas de pan tostado.',
                price: 3.25,
                category: 'ensaladas',
                is_available: true,
                stock: 50,
            },
            {
                name: 'Ensalada Mediterránea',
                description:
                    'Lechuga, tomate, pepino, aceitunas, queso feta, cebolla morada y aderezo de limón.',
                price: 3.5,
                category: 'ensaladas',
                is_available: true,
                stock: 40,
            },
            {
                name: 'Ensalada Tropical',
                description:
                    'Mix de lechugas, mango, piña, pollo, nueces y vinagreta de miel mostaza.',
                price: 4.25,
                category: 'ensaladas',
                is_available: true,
                stock: 35,
            },
            // Bebidas y smoothies
            {
                name: 'Smoothie Verde',
                description:
                    'Batido energizante de espinaca, manzana verde, jengibre y menta',
                price: 2.75,
                category: 'bebidas',
                is_available: true,
                stock: 30,
            },
            {
                name: 'Smoothie de Frutas',
                description:
                    'Batido refrescante de fresa, plátano, yogurt y miel',
                price: 2.75,
                category: 'bebidas',
                is_available: true,
                stock: 30,
            },
            {
                name: 'Jugo Natural',
                description:
                    'Jugo de naranja, zanahoria o piña recién exprimido',
                price: 2.5,
                category: 'bebidas',
                is_available: true,
                stock: 40,
            },
            // Extras
            {
                name: 'Aderezo Extra',
                description:
                    'Ranch, César, Balsámico o Miel Mostaza',
                price: 0.5,
                category: 'extras',
                is_available: true,
                stock: 100,
            },
            {
                name: 'Proteína Extra',
                description:
                    'Porción adicional de pollo, huevo o queso',
                price: 1.0,
                category: 'extras',
                is_available: true,
                stock: 80,
            },
            {
                name: 'Pan Tostado',
                description:
                    'Rebanadas de pan artesanal tostado',
                price: 0.75,
                category: 'extras',
                is_available: true,
                stock: 60,
            },
        ];

        const products: Product[] = [];
        for (const productData of productsData) {
            const existingProduct = await this.productRepository.findOne({
                where: { name: productData.name },
            });

            if (!existingProduct) {
                const product = this.productRepository.create(productData);
                const savedProduct = await this.productRepository.save(product);
                products.push(savedProduct);
            }
        }

        return products;
    }
}