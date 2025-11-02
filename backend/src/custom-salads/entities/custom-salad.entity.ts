import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('custom_salads')
export class CustomSalad {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    base: string; // lechuga, espinaca, kale, mix

    @Column({ type: 'json' })
    vegetables: string[]; // array de vegetales seleccionados

    @Column({ type: 'json' })
    proteins: string[]; // array de proteínas

    @Column({ type: 'varchar', length: 50 })
    dressing: string;

    @Column({ type: 'json', nullable: true })
    extras: string[]; // extras opcionales

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_price: number;

    @Column({ type: 'text', nullable: true })
    notes: string; // notas especiales

    @CreateDateColumn()
    created_at: Date;
}