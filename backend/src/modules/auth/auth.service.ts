import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

const RESET_PASSWORD_EXPIRES_MS = 15 * 60 * 1000;

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

        const { password, refreshToken: rf, resetPasswordToken, resetPasswordExpires, ...result } = user;
        return {
            refreshToken,
            response: {
                statusCode: 200,
                message: 'Login successfully',
                data: {
                    user: result,
                    accessToken,
                },
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
        const { password, refreshToken: rf, resetPasswordToken, resetPasswordExpires, ...result } = user;

        return {
            statusCode: 200,
            message: 'Refresh access token successfully',
            data: {
                accessToken,
                user: result,
            },
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);

        if (user) {
            const resetToken = randomBytes(32).toString('hex');
            const hashedResetToken = this.hashResetToken(resetToken);
            const expires = new Date(Date.now() + RESET_PASSWORD_EXPIRES_MS);

            await this.usersService.updateResetPasswordToken(user.id, hashedResetToken, expires);

            const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
            const resetBaseUrl = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
            const resetUrl = resetBaseUrl + '/reset-password?token=' + resetToken;
            console.log('Reset password link for ' + user.email + ': ' + resetUrl);
        }

        return {
            statusCode: 200,
            message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
        };
    }

    async resetPassword(token: string, password: string) {
        const hashedResetToken = this.hashResetToken(token);
        const user = await this.usersService.findByResetPasswordToken(hashedResetToken);

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires.getTime() < Date.now()) {
            throw new BadRequestException('Reset password token is invalid or expired');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);

        return {
            statusCode: 200,
            message: 'Password reset successfully',
        };
    }

    async logout(refreshToken?: string) {
        if (refreshToken) {
            const user = await this.usersService.findByRefreshToken(refreshToken);
            if (user) {
                await this.usersService.updateToken(user.id, null);
            }
        }

        return {
            statusCode: 200,
            message: 'Logout successfully',
        };
    }

    private hashResetToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }
}
