import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    // 🔹 Cari user berdasarkan email
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    // 🔹 Cari user berdasarkan ID
    async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    // 🔹 Membuat user (dipakai oleh AuthService saat register)
    async create(data: Partial<User>): Promise<User> {
        const user = this.usersRepository.create(data);
        return this.usersRepository.save(user);
    }

    // 🔹 Ambil semua user (untuk fitur melihat todo user lain)
    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'email', 'name', 'role'], // jangan kirim passwordHash!
        });
    }

    // 🔹 Pencarian user berdasarkan nama atau email
    async search(keyword: string): Promise<User[]> {
        return this.usersRepository
            .createQueryBuilder('user')
            .where('user.name ILIKE :kw OR user.email ILIKE :kw', { kw: `%${keyword}%` })
            .select(['user.id', 'user.email', 'user.name', 'user.role'])
            .getMany();
    }
}
