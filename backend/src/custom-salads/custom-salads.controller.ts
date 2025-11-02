import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CustomSaladsService } from './custom-salads.service';
import { CreateCustomSaladDto } from './dto/custom-salad.dto';

@Controller('custom-salads')
export class CustomSaladsController {
    constructor(private readonly customSaladsService: CustomSaladsService) {}

    @Post()
    async create(@Body() createCustomSaladDto: CreateCustomSaladDto) {
        const salad = await this.customSaladsService.create(createCustomSaladDto);
        return {
            message: 'Ensalada personalizada creada exitosamente',
            salad,
        };
    }

    @Get('ingredients')
    getIngredients() {
        return this.customSaladsService.getAvailableIngredients();
    }

    @Get()
    findAll(@Query('user_session') user_session?: string) {
        if (user_session) {
            return this.customSaladsService.findByUser(user_session);
        }
        return this.customSaladsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customSaladsService.findOne(id);
    }
}