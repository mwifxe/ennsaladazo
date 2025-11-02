import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHealthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'Ensaladazo Backend API',
            version: '1.0.0',
        };
    }
}