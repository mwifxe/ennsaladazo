import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    session_id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @OneToMany(() => CartItem, (cartItem) => cartItem.user)
    cart_items: CartItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}