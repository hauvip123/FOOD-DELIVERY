import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) { }

    async register(userData: RegisterDto) {
        const user = await this.usersService.findByEmail(userData.email);
        if (user) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await this.usersService.create({
            ...userData,
            password: hashedPassword,
        });

        return {
            statusCode: 201,
            message: 'Register successfully',
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(
            loginDto.email,
        );

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordMatch = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });
        await this.usersService.updateToken(user.id, refreshToken);

        const { password, refreshToken: rf, ...result } = user;
        return {
            statusCode: 200,
            message: 'Login successfully',
            data: {
                user: result,
                accessToken,
                refreshToken,
            },
        };
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            await this.jwtService.verifyAsync(refreshToken);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.usersService.findByRefreshToken(refreshToken);
        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const { password, refreshToken: rf, ...result } = user;

        return {
            statusCode: 200,
            message: 'Refresh access token successfully',
            data: {
                accessToken,
                user: result,
            },
        };
    }
}
