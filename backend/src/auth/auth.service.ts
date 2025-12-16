import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserType } from '../users/dto/user.type';

export interface AuthResponse {
  token: string;
  user: UserType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.usersService.create(email, hashedPassword);

    const token = await this.signToken(user.id, user.email);

    return {
      token,
      user: this.toUserType(user),
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.signToken(user.id, user.email);

    return {
      token,
      user: this.toUserType(user),
    };
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: parseInt(process.env.JWT_EXPIRATION, 10) || 1000,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private toUserType(user: {
    id: number;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserType {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
