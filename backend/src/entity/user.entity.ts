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

    @Column({ type: "varchar", nullable: true })
    phoneNumber: string | null;

    @Column({ type: "varchar", nullable: true })
    avatar: string | null;

    @Column({ default: 'customer' })
    role: string;

    @Column({ default: 'active' })
    status: string;

    @Column({ type: "varchar", length: 512, nullable: true })
    refreshToken: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
