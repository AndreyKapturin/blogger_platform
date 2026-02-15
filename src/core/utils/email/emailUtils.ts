import nodemailer from 'nodemailer';
import { EMAIL_SERVICE_PASSWORD, EMAIL_SERVICE_USER_EMAIL, EMAIL_SERVICE_USER_LOGIN } from '../../config';

const transporter = nodemailer.createTransport({
  service: 'Yandex',
  auth: {
    user: EMAIL_SERVICE_USER_LOGIN,
    pass: EMAIL_SERVICE_PASSWORD,
  },
});

const sendEmail = async (recipientAddress: string, theme: string, html: string) => {
  return await transporter.sendMail({
    from: `Bloggers platform <${EMAIL_SERVICE_USER_EMAIL}>`,
    to: recipientAddress,
    subject: theme,
    html,
  });
};

export { sendEmail }