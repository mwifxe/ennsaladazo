import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('health')
    getHealth() {
        return this.appService.getHealthCheck();
    }

    @Get()
    getRoot() {
        return {
            message: 'Bienvenido a Ensaladazo! API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                products: '/api/products',
                cart: '/api/cart',
                users: '/api/users',
            },
        };
    }
}