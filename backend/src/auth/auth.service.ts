import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already used');

        const hash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash: hash,
            name: dto.name,
        });

        const tokens = this.getTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) throw new UnauthorizedException('Invalid credentials');

        const tokens = this.getTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }

    private sanitizeUser(user: User) {
        const { passwordHash, ...rest } = user;
        return rest;
    }

    getTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };

        const accessToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: 'test_secret',
                expiresIn: '1h',
            },
        );
        const refreshToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: 'test_refresh',
                expiresIn: '7d',
            },
        );
        return { accessToken, refreshToken };
    }
}
