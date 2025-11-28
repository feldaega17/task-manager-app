import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepo: Repository<Task>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) { }

    async create(dto: any, userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const task = this.taskRepo.create({
            ...dto,
            owner: user,
        });
        const saved = await this.taskRepo.save(task);
        return this.sanitizeTask(saved as unknown as Task);
    }

    private sanitizeTask(task: Task): any {
        if (!task) return task;
        const result = { ...task };
        if (result.owner && 'passwordHash' in result.owner) {
            const { passwordHash, ...ownerRest } = result.owner as any;
            result.owner = ownerRest;
        }
        return result;
    }

    async findAllForUser(
        userId: number,
        query?: { search?: string; priority?: string; status?: string; page?: number; limit?: number },
    ) {
        const { search, priority, status, page = 1, limit = 10 } = query || {};

        const qb = this.taskRepo
            .createQueryBuilder('task')
            .leftJoin('task.owner', 'owner')
            .leftJoinAndSelect('task.category', 'category')
            .where('owner.id = :userId', { userId });

        if (search) {
            qb.andWhere('task.title ILIKE :search', { search: `%${search}%` });
        }
        if (priority) {
            qb.andWhere('task.priority = :priority', { priority });
        }
        if (status) {
            qb.andWhere('task.status = :status', { status });
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit };
    }

    async toggleStatus(id: number, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner'] });
        if (!task) throw new NotFoundException();
        if (task.owner.id !== userId) throw new ForbiddenException();

        task.status = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        return this.taskRepo.save(task);
    }

    async findOne(id: number, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner', 'category'] });
        if (!task) throw new NotFoundException();
        if (task.owner.id !== userId) throw new ForbiddenException();
        return task;
    }

    async update(id: number, dto: any, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner'] });
        if (!task) throw new NotFoundException();
        if (task.owner.id !== userId) throw new ForbiddenException();

        Object.assign(task, dto);
        return this.taskRepo.save(task);
    }

    async remove(id: number, userId: number) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner'] });
        if (!task) throw new NotFoundException();
        if (task.owner.id !== userId) throw new ForbiddenException();

        return this.taskRepo.remove(task);
    }

    async attachFile(id: number, userId: number, filename: string) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['owner'] });
        if (!task) throw new NotFoundException();
        if (task.owner.id !== userId) throw new ForbiddenException();

        task.attachmentPath = filename;
        return this.taskRepo.save(task);
    }

    async findPublicTasksByUser(userId: number) {
        const tasks = await this.taskRepo.find({
            where: {
                owner: { id: userId },
                isPublic: true,
            },
            relations: ['owner', 'category'],
        });
        return tasks.map(task => this.sanitizeTask(task));
    }

    async sendDueSoonEmails(mailService: MailService) {
        // Find tasks due within 24 hours with PENDING status
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const tasks = await this.taskRepo.find({
            where: {
                status: 'PENDING',
            },
            relations: ['owner'],
        });

        for (const task of tasks) {
            if (task.dueDate && task.dueDate <= tomorrow) {
                // Send email notification
                await mailService.sendMail(
                    task.owner.email,
                    `Task Due Soon: ${task.title}`,
                    `Your task "${task.title}" is due soon on ${task.dueDate.toDateString()}`,
                );
            }
        }
    }

    async sendDailySummaryEmails(mailService: MailService) {
        // Send daily summary of tasks to all users
        const tasks = await this.taskRepo.find({ relations: ['owner'] });

        // Group tasks by owner and send summary
        const tasksByUser = new Map<number, Task[]>();
        for (const task of tasks) {
            if (!tasksByUser.has(task.owner.id)) {
                tasksByUser.set(task.owner.id, []);
            }
            tasksByUser.get(task.owner.id)!.push(task);
        }

        for (const [userId, userTasks] of tasksByUser) {
            const owner = userTasks[0].owner;
            const summary = userTasks.map(t => `- ${t.title} (${t.status})`).join('\n');
            await mailService.sendMail(
                owner.email,
                'Daily Task Summary',
                `Here is your daily task summary:\n${summary}`,
            );
        }
    }
}
