import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { User } from './user.entity';

@Entity('favorite_restaurants')
@Unique(['userId', 'restaurantId'])
export class FavoriteRestaurant {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Index()
    @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurantId' })
    restaurant: Restaurant;

    @Column()
    restaurantId: number;

    @CreateDateColumn()
    createdAt: Date;
}
