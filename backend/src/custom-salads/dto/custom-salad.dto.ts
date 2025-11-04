import {
    IsString,
    IsArray,
    IsNumber,
    IsOptional,
    Min,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para cada ingrediente individual
export class IngredientDto {
    @IsString()
    name: string;

    @IsString()
    category: string;

    @IsNumber()
    price: number;
}

// DTO para crear ensalada personalizada (CORREGIDO)
export class CreateCustomSaladDto {
    @IsString()
    user_session: string;

    @IsString()
    @MaxLength(100)
    name: string;

    // ✅ NUEVO: Aceptar array de ingredientes
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IngredientDto)
    ingredients: IngredientDto[];

    @IsNumber()
    @Min(0)
    total_price: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class CustomSaladIngredientsDto {
    bases: IngredientOption[];
    vegetables: IngredientOption[];
    proteins: IngredientOption[];
    toppings?: IngredientOption[];
    dressings: IngredientOption[];
    extras?: IngredientOption[];
}

export class IngredientOption {
    name: string;
    price: number;
    available: boolean;
}