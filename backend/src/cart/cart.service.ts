import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartItem)
        private readonly cartItemRepository: Repository<CartItem>,
        private readonly usersService: UsersService,
        private readonly productsService: ProductsService,
    ) {}

    async addToCart(addToCartDto: AddToCartDto): Promise<CartItem> {
        const { user_session, product_name, quantity, unit_price } = addToCartDto;

        // Obtener o crear usuario
        const user = await this.usersService.findBySessionId(user_session);

        // Buscar producto por nombre
        const products = await this.productsService.findAll();
        const product = products.find(
            (p) => p.name.toLowerCase() === product_name.toLowerCase(),
        );

        if (!product) {
            throw new NotFoundException(`Producto "${product_name}" no encontrado`);
        }

        // Verificar si ya existe en el carrito
        const existingCartItem = await this.cartItemRepository.findOne({
            where: {
                user_id: user.id,
                product_id: product.id,
            },
        });

        if (existingCartItem) {
            // Actualizar cantidad
            existingCartItem.quantity += quantity;
            return await this.cartItemRepository.save(existingCartItem);
        }

        // Crear nuevo item
        const cartItem = this.cartItemRepository.create({
            user_id: user.id,
            product_id: product.id,
            quantity,
            unit_price,
        });

        return await this.cartItemRepository.save(cartItem);
    }

    async getCart(user_session: string) {
        const user = await this.usersService.findBySessionId(user_session);

        const cartItems = await this.cartItemRepository.find({
            where: { user_id: user.id },
            relations: ['product'],
            order: { created_at: 'DESC' },
        });

        const total = cartItems.reduce(
            (sum, item) => sum + Number(item.unit_price) * item.quantity,
            0,
        );

        return {
            items: cartItems,
            total: Number(total.toFixed(2)),
            count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        };
    }

    async updateQuantity(
        cart_item_id: string,
        updateCartItemDto: UpdateCartItemDto,
    ): Promise<CartItem> {
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: cart_item_id },
        });

        if (!cartItem) {
            throw new NotFoundException(
                `Item del carrito con ID ${cart_item_id} no encontrado`,
            );
        }

        cartItem.quantity = updateCartItemDto.quantity;
        return await this.cartItemRepository.save(cartItem);
    }

    async removeFromCart(cart_item_id: string): Promise<void> {
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: cart_item_id },
        });

        if (!cartItem) {
            throw new NotFoundException(
                `Item del carrito con ID ${cart_item_id} no encontrado`,
            );
        }

        await this.cartItemRepository.remove(cartItem);
    }

    async clearCart(user_session: string): Promise<void> {
        const user = await this.usersService.findBySessionId(user_session);

        await this.cartItemRepository.delete({ user_id: user.id });
    }

    // ⭐ MÉTODO CORREGIDO PARA MIGRAR CARRITO CON TYPEORM
    async migrateCart(tempSession: string, newSession: string) {
        if (!tempSession || !newSession) {
            throw new Error('Faltan datos para migrar el carrito');
        }

        try {
            console.log(`🔄 Migrando carrito de ${tempSession} a ${newSession}`);

            // 1. Buscar el usuario temporal
            const tempUser = await this.usersService.findBySessionId(tempSession);
            
            // 2. Buscar u obtener el usuario real (con la nueva sesión)
            const realUser = await this.usersService.findBySessionId(newSession);

            // 3. Si son el mismo usuario, no hay nada que migrar
            if (tempUser.id === realUser.id) {
                console.log('⚠️ Las sesiones pertenecen al mismo usuario');
                return {
                    success: true,
                    message: 'No hay items para migrar',
                    items_migrated: 0,
                };
            }

            // 4. Obtener todos los items del carrito temporal
            const tempCartItems = await this.cartItemRepository.find({
                where: { user_id: tempUser.id },
            });

            console.log(`📦 Items encontrados en carrito temporal: ${tempCartItems.length}`);

            if (tempCartItems.length === 0) {
                return {
                    success: true,
                    message: 'No hay items para migrar',
                    items_migrated: 0,
                };
            }

            // 5. Migrar cada item al usuario real
            let migratedCount = 0;

            for (const tempItem of tempCartItems) {
                // Verificar si el producto ya existe en el carrito del usuario real
                const existingItem = await this.cartItemRepository.findOne({
                    where: {
                        user_id: realUser.id,
                        product_id: tempItem.product_id,
                    },
                });

                if (existingItem) {
                    // Si existe, sumar las cantidades
                    existingItem.quantity += tempItem.quantity;
                    await this.cartItemRepository.save(existingItem);
                    // Eliminar el item temporal
                    await this.cartItemRepository.remove(tempItem);
                } else {
                    // Si no existe, cambiar el user_id
                    tempItem.user_id = realUser.id;
                    await this.cartItemRepository.save(tempItem);
                }

                migratedCount++;
            }

            console.log(`✅ Carrito migrado exitosamente`);
            console.log(`   Items migrados: ${migratedCount}`);

            return {
                success: true,
                message: 'Carrito migrado exitosamente',
                items_migrated: migratedCount,
            };
        } catch (error) {
            console.error('❌ Error al migrar carrito:', error);
            throw new Error('Error al migrar carrito: ' + error.message);
        }
    }
}