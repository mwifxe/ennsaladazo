import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(ContactMessage)
        private readonly contactMessageRepository: Repository<ContactMessage>,
    ) {}

    async create(
        createContactMessageDto: CreateContactMessageDto,
    ): Promise<ContactMessage> {
        const message = this.contactMessageRepository.create(createContactMessageDto);
        return await this.contactMessageRepository.save(message);
    }

    async findAll(): Promise<ContactMessage[]> {
        return await this.contactMessageRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<ContactMessage> {
        const message = await this.contactMessageRepository.findOne({ where: { id } });
        if (!message) {
            throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
        }
        return message;
    }

    async updateStatus(id: string, status: string): Promise<ContactMessage> {
        const message = await this.findOne(id);
        message.status = status;
        return await this.contactMessageRepository.save(message);
    }
}