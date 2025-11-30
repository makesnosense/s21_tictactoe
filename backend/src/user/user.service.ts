import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export interface User {
  id: string;
  username: string;
  password: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: DatabaseService) {}
  async create(username: string, password: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
