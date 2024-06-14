import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from 'nodemailer';

import { readFileSync } from 'fs';

import Logger from '@/lib/logger';
import env from '@/env';
import path from 'path';

const transporter: Transporter = nodemailer.createTransport({
  service: env.BOT_MAILER_SERVICE,
  auth: {
    user: env.BOT_MAILER,
    pass: env.BOT_MAILER_PASSWORD,
  },
});

interface MailOptions extends SendMailOptions{
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

const sendVerificationEmail = async (
  to: string,
  verificationCode: number,
  user: string,
): Promise<number> => {
  let index = readFileSync(path.join(__dirname, 'reccources/index.html'), 'utf8');
  index = index.replace('{{verificationCode}}', verificationCode.toString());
  index = index.replace('{{user}}', user);

  const mailOptions: MailOptions = {
    from: env.BOT_MAILER,
    to,
    subject: 'Verification - Epitech Roles Manager',
    text: `Here is your code: ${verificationCode}\n\nIf you didn't ask for it, the request comes from the discord user ${user}`,
    html: index,
  };

  return new Promise((resolve) => {
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          Logger.error('error', `Error sending email: ${error}`);
          resolve(84);
        } else {
          Logger.debug('info', `Email sent: ${info.response}`);
          resolve(0);
        }
      },
    );
  });
};

export default sendVerificationEmail;
