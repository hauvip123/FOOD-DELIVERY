import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  id: number;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.id);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
