import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Post('add')
    addToCart(@Body() addToCartDto: AddToCartDto) {
        return this.cartService.addToCart(addToCartDto);
    }

    @Get()
    getCart(@Query('user_session') user_session: string) {
        return this.cartService.getCart(user_session);
    }

    @Patch(':id')
    updateQuantity(
        @Param('id') id: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateQuantity(id, updateCartItemDto);
    }

    @Delete(':id')
    removeFromCart(@Param('id') id: string) {
        return this.cartService.removeFromCart(id);
    }

    @Delete('clear/all')
    clearCart(@Query('user_session') user_session: string) {
        return this.cartService.clearCart(user_session);
    }

    @Post('migrate')
    migrateCart(
      @Body() body: { temp_session: string; new_session: string },
    ) {
      return this.cartService.migrateCart(body.temp_session, body.new_session);
    }
}