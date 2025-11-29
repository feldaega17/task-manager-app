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

    async sendMail(to: string, subject: string, text: string, html?: string) {
        try {
            await this.transporter.sendMail({
                from: `"Task Manager" <${process.env.MAIL_USER}>`,
                to,
                subject,
                text,
                html: html || this.textToHtml(text),
            });
            this.logger.log(`Email sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw error;
        }
    }

    private textToHtml(text: string): string {
        // Convert plain text to simple HTML
        const htmlContent = text
            .replace(/\n/g, '<br>')
            .replace(/📋/g, '📋')
            .replace(/📝/g, '📝')
            .replace(/🎯/g, '🎯')
            .replace(/📅/g, '📅')
            .replace(/⏰/g, '⏰')
            .replace(/📊/g, '📊')
            .replace(/🔴/g, '🔴')
            .replace(/🟡/g, '🟡')
            .replace(/🟢/g, '🟢')
            .replace(/⚪/g, '⚪');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 8px 8px 0 0;
                        text-align: center;
                    }
                    .content {
                        background: #f9fafb;
                        padding: 20px;
                        border: 1px solid #e5e7eb;
                        border-top: none;
                        border-radius: 0 0 8px 8px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #6b7280;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2 style="margin: 0;">📋 Task Manager</h2>
                </div>
                <div class="content">
                    ${htmlContent}
                </div>
                <div class="footer">
                    <p>This is an automated message from Task Manager App</p>
                </div>
            </body>
            </html>
        `;
    }
}
