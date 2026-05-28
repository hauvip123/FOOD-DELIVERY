import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    phoneNumber: string | null;

    @Column({ nullable: true })
    avatar: string | null;

    @Column({ default: 'customer' })
    role: string;

    @Column({ default: 'active' })
    status: string;

    @Column({ nullable: true })
    refreshToken: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
