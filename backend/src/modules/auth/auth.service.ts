import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/entity/user.entity';
import { MailService } from './mail.service';

const RESET_PASSWORD_EXPIRES_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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
    const user = await this.usersService.findByEmail(loginDto.email);

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

    if (user.status !== 'active') {
      await this.usersService.updateToken(user.id, null);
      throw new UnauthorizedException('Account is inactive');
    }

    const session = await this.createSession(user);

    return {
      refreshToken: session.refreshToken,
      response: {
        statusCode: 200,
        message: 'Login successfully',
        data: {
          user: session.user,
          accessToken: session.accessToken,
        },
      },
    };
  }

  async loginWithGoogle(credential: string) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new BadRequestException('Google login is not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    let user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      const fallbackName = payload.email.split('@')[0];
      const randomPassword = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        10,
      );

      user = await this.usersService.create({
        username: payload.name ?? fallbackName,
        email: payload.email,
        password: randomPassword,
        avatar: payload.picture ?? null,
        role: 'customer',
        status: 'active',
      });
    }

    if (user.status !== 'active') {
      await this.usersService.updateToken(user.id, null);
      throw new UnauthorizedException('Account is inactive');
    }

    const session = await this.createSession(user);

    return {
      refreshToken: session.refreshToken,
      response: {
        statusCode: 200,
        message: 'Login with Google successfully',
        data: {
          user: session.user,
          accessToken: session.accessToken,
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

    if (user.status !== 'active') {
      await this.usersService.updateToken(user.id, null);
      throw new UnauthorizedException('Account is inactive');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const result = this.toSafeUser(user);

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

      await this.usersService.updateResetPasswordToken(
        user.id,
        hashedResetToken,
        expires,
      );

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
      const resetBaseUrl = frontendUrl.endsWith('/')
        ? frontendUrl.slice(0, -1)
        : frontendUrl;
      const resetUrl = resetBaseUrl + '/reset-password?token=' + resetToken;
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
    }

    return {
      statusCode: 200,
      message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
    };
  }

  async resetPassword(token: string, password: string) {
    const hashedResetToken = this.hashResetToken(token);
    const user =
      await this.usersService.findByResetPasswordToken(hashedResetToken);

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires.getTime() < Date.now()
    ) {
      throw new BadRequestException(
        'Reset password token is invalid or expired',
      );
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

  private async createSession(user: User) {
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

    return {
      accessToken,
      refreshToken,
      user: this.toSafeUser(user),
    };
  }

  private toSafeUser(user: User) {
    const {
      password,
      refreshToken,
      resetPasswordToken,
      resetPasswordExpires,
      ...result
    } = user;
    void password;
    void refreshToken;
    void resetPasswordToken;
    void resetPasswordExpires;

    return result;
  }
}
