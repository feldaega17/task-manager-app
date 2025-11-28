import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private logger = new Logger(MailService.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendMail(to: string, subject: string, text: string) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            text,
        });
        this.logger.log(`Email sent to ${to}`);
    }
}
