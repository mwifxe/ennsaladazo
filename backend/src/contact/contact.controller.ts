import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    async create(@Body() createContactMessageDto: CreateContactMessageDto) {
        const message = await this.contactService.create(createContactMessageDto);
        return {
            message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
            id: message.id,
        };
    }

    @Get()
    async findAll() {
        return await this.contactService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.contactService.findOne(id);
    }

    @Patch(':id/status/:status')
    async updateStatus(
        @Param('id') id: string,
        @Param('status') status: string,
    ) {
        return await this.contactService.updateStatus(id, status);
    }
}