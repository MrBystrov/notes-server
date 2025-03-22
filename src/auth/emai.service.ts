import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com', // Replace with your SMTP server
      port: 587,
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });
  }

  async sendPasswordResetLink(email: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: '"Your App" <no-reply@example.com>',
      to: email,
      subject: 'Сброс пароля',
      text: `Перейдите по ссылке, чтобы сбросить пароль: ${resetUrl}`,
      html: `<p>Перейдите по ссылке, чтобы сбросить пароль: <a href="${resetUrl}">Сбросить пароль</a></p>`,
    });
  }
}
