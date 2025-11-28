import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { TasksService } from '../tasks/tasks.service';
import { MailService } from '../mail/mail.service';

describe('RemindersService', () => {
  let service: RemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: TasksService,
          useValue: {
            sendDueSoonEmails: jest.fn(),
            sendDailySummaryEmails: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
