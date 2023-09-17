import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import configuration from 'src/config/configuration';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  private constructor(
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  public sendMail(to: string, subject: string, message: string) {
    return new Promise<void>((resolve, reject) => {
      this.transporter.sendMail(
        {
          to,
          from: `Craiyon <${this.config.email.user}>`,
          subject,
          html: message,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  public sendAccoutVerificationMail(to: string, verificationUrl: string) {
    const subject = 'Craiyon: Account verification needed';
    const message = `
      <h2 align='center'>Welcome to Craiyon!</h2>
      <p>Thank you for registering. To use all of our features, please verify your account by clicking on the link below:</p>
      <a href='${verificationUrl}'>Verify Email</a>
      <p>If you cannot click on the link above, paste this url in browser: ${verificationUrl}</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>Thank you,<br>Team Craiyon</p>
    `;

    try {
      this.sendMail(to, subject, message);
    } catch (error) {
      console.error(error);
    }
  }

  public sendPasswordResetMail(to: string, passwordResetUrl: string) {
    const subject = 'Craiyon: Password reset';
    const message = `
      <h2 align='center'>Reset your password</h2>
      <p>Please click on this link to reset your password:</p>
      <a href='${passwordResetUrl}'>Reset Password</a>
      <p>If you cannot click on the link above, paste this url in browser: ${passwordResetUrl}</p>
      <p>If you did not request for a password reset, please ignore this email.</p>
      <p>Thank you,<br>Team Craiyon</p>
    `;

    try {
      this.sendMail(to, subject, message);
    } catch (error) {
      console.error(error);
    }
  }
}
