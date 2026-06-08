import { Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT ?? 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
      this.logger.warn(
        'SMTP is not configured. Password reset link for ' +
          email +
          ': ' +
          resetUrl,
      );
      return;
    }

    const transporter = createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Đặt lại mật khẩu HungerDash',
      text:
        'Bạn vừa yêu cầu đặt lại mật khẩu HungerDash. Mở link này trong 15 phút: ' +
        resetUrl,
      html: this.getPasswordResetHtml(resetUrl),
    });
  }

  private getPasswordResetHtml(resetUrl: string) {
    return [
      '<div style="margin:0;background:#fff7ed;padding:32px;font-family:Arial,sans-serif;color:#23140c">',
      '<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;box-shadow:0 24px 70px rgba(35,20,12,0.12)">',
      '<div style="display:inline-block;background:#ff6b00;color:#ffffff;font-weight:900;padding:10px 14px;border-radius:14px;font-style:italic">HD</div>',
      '<h1 style="margin:24px 0 12px;font-size:28px;line-height:1.15">Đặt lại mật khẩu</h1>',
      '<p style="margin:0 0 24px;color:#704322;line-height:1.6">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HungerDash. Link này chỉ có hiệu lực trong 15 phút.</p>',
      '<a href="' +
        resetUrl +
        '" style="display:inline-block;background:#23140c;color:#ffffff;text-decoration:none;font-weight:800;padding:16px 22px;border-radius:16px">Đổi mật khẩu</a>',
      '<p style="margin:24px 0 0;color:#704322;font-size:13px;line-height:1.6">Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email này.</p>',
      '</div>',
      '</div>',
    ].join('');
  }
}
