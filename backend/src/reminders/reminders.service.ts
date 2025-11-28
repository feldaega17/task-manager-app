import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TasksService } from '../tasks/tasks.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RemindersService {
    constructor(private tasksService: TasksService, private mailService: MailService) { }

    // jalan tiap jam, kirim reminder H-1
    @Cron(CronExpression.EVERY_HOUR)
    async sendDueSoonReminders() {
        // cari task yang dueDate dalam 24 jam dan status PENDING
        await this.tasksService.sendDueSoonEmails(this.mailService);
    }

    // jalan tiap hari jam 08:00
    @Cron('0 0 8 * * *')
    async sendDailySummary() {
        await this.tasksService.sendDailySummaryEmails(this.mailService);
    }
}
