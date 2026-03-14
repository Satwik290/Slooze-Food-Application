import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // BUG FIX: throw if JWT_SECRET is missing rather than silently using a weak fallback
      secretOrKey:
        process.env.JWT_SECRET ??
        (() => {
          throw new Error('JWT_SECRET environment variable is required');
        })(),
    });
  }

  async validate(payload: {
    sub?: string;
    userId?: string;
    email: string;
    role: string;
    regionId: string;
  }) {
    const id = payload.sub || payload.userId;
    if (!id) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { region: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    // BUG FIX: return only `id` — previously both `id` and `userId` were returned
    // (same value duplicated). Standardise to `id` everywhere.
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      regionId: user.regionId,
      region: user.region,
    };
  }
}
