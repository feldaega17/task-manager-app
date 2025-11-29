import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { TasksModule } from '../tasks/tasks.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [TasksModule, MailModule],
    controllers: [RemindersController],
    providers: [RemindersService],
    exports: [RemindersService],
})
export class RemindersModule { }
