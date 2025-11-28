import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) { }

    async create(data: Partial<Category>, userId: number) {
        const category = this.categoryRepository.create({
            ...data,
            owner: { id: userId },
        });
        return this.categoryRepository.save(category);
    }

    async findAll(userId: number) {
        return this.categoryRepository.find({
            where: { owner: { id: userId } },
        });
    }

    async findOne(id: number, userId: number) {
        const category = await this.categoryRepository.findOne({
            where: { id, owner: { id: userId } },
        });
        if (!category) throw new NotFoundException();
        return category;
    }

    async update(id: number, data: Partial<Category>, userId: number) {
        const category = await this.findOne(id, userId);
        Object.assign(category, data);
        return this.categoryRepository.save(category);
    }

    async remove(id: number, userId: number) {
        const category = await this.findOne(id, userId);
        return this.categoryRepository.remove(category);
    }
}
