import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';
import { Category } from './categories/category.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RemindersService } from './reminders/reminders.service';
import { MailModule } from './mail/mail.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Task, Category],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    MailModule,
  ],
  providers: [],
})
export class AppModule { }
