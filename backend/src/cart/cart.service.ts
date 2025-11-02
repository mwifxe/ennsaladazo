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
}