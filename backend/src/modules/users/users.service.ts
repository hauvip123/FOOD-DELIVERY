import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async updateToken(userId: number, token: string | null) {
        await this.userRepository.update(userId, { refreshToken: token });
    }

    async findByRefreshToken(refreshToken: string) {
        return this.userRepository.findOne({ where: { refreshToken } });
    }

    async updateResetPasswordToken(userId: number, token: string | null, expires: Date | null) {
        await this.userRepository.update(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });
    }

    async findByResetPasswordToken(resetPasswordToken: string) {
        return this.userRepository.findOne({ where: { resetPasswordToken } });
    }

    async updatePassword(userId: number, password: string) {
        await this.userRepository.update(userId, {
            password,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            refreshToken: null,
        });
    }
}
