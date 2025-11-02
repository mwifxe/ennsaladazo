import {
    IsString,
    IsArray,
    IsNumber,
    IsOptional,
    Min,
    MaxLength,
} from 'class-validator';

export class CreateCustomSaladDto {
    @IsString()
    user_session: string;

    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    base: string;

    @IsArray()
    @IsString({ each: true })
    vegetables: string[];

    @IsArray()
    @IsString({ each: true })
    proteins: string[];

    @IsString()
    dressing: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    extras?: string[];

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
    dressings: IngredientOption[];
    extras: IngredientOption[];
}

export class IngredientOption {
    name: string;
    price: number;
    available: boolean;
}