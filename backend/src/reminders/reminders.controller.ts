import { Controller, Post, Get } from '@nestjs/common';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) { }

    // Manual trigger untuk test - kirim reminder H-1
    @Post('test/due-soon')
    async testDueSoonReminders() {
        await this.remindersService.sendDueSoonReminders();
        return { message: 'Due soon reminders sent (check logs for details)' };
    }

    // Manual trigger untuk test - kirim daily summary
    @Post('test/daily-summary')
    async testDailySummary() {
        await this.remindersService.sendDailySummary();
        return { message: 'Daily summary emails sent (check logs for details)' };
    }

    // Test email configuration
    @Get('test/config')
    testConfig() {
        return {
            mailUser: process.env.MAIL_USER ? `${process.env.MAIL_USER.substring(0, 3)}***` : 'NOT SET',
            mailPass: process.env.MAIL_PASS ? 'SET (hidden)' : 'NOT SET',
        };
    }
}
