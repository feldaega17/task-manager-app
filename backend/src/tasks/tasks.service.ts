import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        @InjectRepository(Task)
        private taskRepo: Repository<Task>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>,
    ) { }

    async create(dto: any, userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Handle categoryId - convert to category relation
        let category: Category | null = null;
        if (dto.categoryId) {
            category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        }

        // Remove categoryId from dto and add category relation
        const { categoryId, ...taskData } = dto;

        const task = this.taskRepo.create({
            ...taskData,
            owner: user,
            category: category,
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

        // Reset reminder flag if due date is changed
        if (dto.dueDate && dto.dueDate !== task.dueDate) {
            task.reminderSent = false;
        }

        // Handle categoryId - convert to category relation
        if (dto.categoryId !== undefined) {
            if (dto.categoryId) {
                const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
                (task as any).category = category;
            } else {
                (task as any).category = null;
            }
            delete dto.categoryId;
        }

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
        // Find tasks due within 24 hours with PENDING status and reminder not yet sent
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        this.logger.log('Checking for tasks due within 24 hours...');

        const tasks = await this.taskRepo.find({
            where: {
                status: 'PENDING',
                reminderSent: false,
            },
            relations: ['owner'],
        });

        let sentCount = 0;
        for (const task of tasks) {
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                // Check if task is due within 24 hours and not already overdue
                if (dueDate >= now && dueDate <= tomorrow) {
                    try {
                        const formattedDate = dueDate.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        await mailService.sendMail(
                            task.owner.email,
                            `⏰ Reminder: Task "${task.title}" is due soon!`,
                            `Hi ${task.owner.name},\n\n` +
                            `This is a reminder that your task is due soon:\n\n` +
                            `📋 Task: ${task.title}\n` +
                            `📝 Description: ${task.description || 'No description'}\n` +
                            `🎯 Priority: ${task.priority}\n` +
                            `📅 Due Date: ${formattedDate}\n\n` +
                            `Please make sure to complete it on time!\n\n` +
                            `Best regards,\nTask Manager App`,
                        );

                        // Mark reminder as sent to avoid duplicate emails
                        task.reminderSent = true;
                        await this.taskRepo.save(task);
                        sentCount++;

                        this.logger.log(`Reminder sent for task "${task.title}" to ${task.owner.email}`);
                    } catch (error) {
                        this.logger.error(`Failed to send reminder for task ${task.id}: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`Due soon reminders sent: ${sentCount}`);
    }

    async sendDailySummaryEmails(mailService: MailService) {
        this.logger.log('Sending daily task summaries...');

        // Get all users with their pending tasks
        const users = await this.userRepo.find();

        for (const user of users) {
            const pendingTasks = await this.taskRepo.find({
                where: {
                    owner: { id: user.id },
                    status: 'PENDING',
                },
                relations: ['category'],
                order: {
                    dueDate: 'ASC',
                    priority: 'DESC',
                },
            });

            // Only send email if user has pending tasks
            if (pendingTasks.length === 0) {
                continue;
            }

            // Categorize tasks
            const overdueTasks: Task[] = [];
            const todayTasks: Task[] = [];
            const upcomingTasks: Task[] = [];
            const noDueDateTasks: Task[] = [];

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

            for (const task of pendingTasks) {
                if (!task.dueDate) {
                    noDueDateTasks.push(task);
                } else {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate < today) {
                        overdueTasks.push(task);
                    } else if (dueDate >= today && dueDate < tomorrow) {
                        todayTasks.push(task);
                    } else {
                        upcomingTasks.push(task);
                    }
                }
            }

            // Build email content
            let emailContent = `Hi ${user.name},\n\n`;
            emailContent += `Here is your daily task summary:\n\n`;
            emailContent += `📊 Total Pending Tasks: ${pendingTasks.length}\n\n`;

            if (overdueTasks.length > 0) {
                emailContent += `🔴 OVERDUE TASKS (${overdueTasks.length}):\n`;
                for (const task of overdueTasks) {
                    const dueDate = new Date(task.dueDate).toLocaleDateString('id-ID');
                    emailContent += `   • ${task.title} [${task.priority}] - Due: ${dueDate}\n`;
                }
                emailContent += '\n';
            }

            if (todayTasks.length > 0) {
                emailContent += `🟡 DUE TODAY (${todayTasks.length}):\n`;
                for (const task of todayTasks) {
                    emailContent += `   • ${task.title} [${task.priority}]\n`;
                }
                emailContent += '\n';
            }

            if (upcomingTasks.length > 0) {
                emailContent += `🟢 UPCOMING TASKS (${upcomingTasks.length}):\n`;
                for (const task of upcomingTasks.slice(0, 5)) { // Show max 5 upcoming tasks
                    const dueDate = new Date(task.dueDate).toLocaleDateString('id-ID');
                    emailContent += `   • ${task.title} [${task.priority}] - Due: ${dueDate}\n`;
                }
                if (upcomingTasks.length > 5) {
                    emailContent += `   ... and ${upcomingTasks.length - 5} more tasks\n`;
                }
                emailContent += '\n';
            }

            if (noDueDateTasks.length > 0) {
                emailContent += `⚪ NO DUE DATE (${noDueDateTasks.length}):\n`;
                for (const task of noDueDateTasks.slice(0, 3)) { // Show max 3
                    emailContent += `   • ${task.title} [${task.priority}]\n`;
                }
                if (noDueDateTasks.length > 3) {
                    emailContent += `   ... and ${noDueDateTasks.length - 3} more tasks\n`;
                }
                emailContent += '\n';
            }

            emailContent += `\nHave a productive day!\n`;
            emailContent += `Best regards,\nTask Manager App`;

            try {
                await mailService.sendMail(
                    user.email,
                    `📋 Daily Task Summary - ${pendingTasks.length} pending tasks`,
                    emailContent,
                );
                this.logger.log(`Daily summary sent to ${user.email}`);
            } catch (error) {
                this.logger.error(`Failed to send daily summary to ${user.email}: ${error.message}`);
            }
        }

        this.logger.log('Daily summary emails completed');
    }

    // Reset reminder flag when task due date is changed
    async resetReminderFlag(taskId: number) {
        await this.taskRepo.update(taskId, { reminderSent: false });
    }
}
