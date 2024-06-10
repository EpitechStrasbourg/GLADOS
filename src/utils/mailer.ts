import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from 'nodemailer';

import Logger from '@/lib/logger';

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'epitechDiscordBot@gmail.com',
    pass: 'hxbdgtpckzlcrjhg',
  },
});

interface MailOptions extends SendMailOptions {
  from: string
  to: string
  subject: string
  text: string
}

const sendVerificationEmail = async (
  to: string,
  verificationCode: number,
): Promise<number> => {
  const mailOptions: MailOptions = {
    from: 'epitechDiscordBot@gmail.com',
    to,
    subject: 'Verification - Epitech Roles Manager',
    text: `Here is your code: ${verificationCode}`,
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
