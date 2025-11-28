import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { TasksModule } from '../tasks/tasks.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [TasksModule, MailModule],
    providers: [RemindersService],
    exports: [RemindersService],
})
export class RemindersModule { }
