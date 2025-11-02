import { IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
    @IsString()
    user_session: string;

    @IsString()
    product_name: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    unit_price: number;
}

export class UpdateCartItemDto {
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class RemoveFromCartDto {
    @IsString()
    user_session: string;

    @IsUUID()
    cart_item_id: string;
}