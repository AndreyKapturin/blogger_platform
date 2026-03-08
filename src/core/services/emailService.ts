import { sendEmail } from '../utils/email/emailUtils';

class EmailService {
  static async sendConfirmationCode(recipientAddress: string, confirmationCode: string) {
    return sendEmail(
      recipientAddress,
      'Email confirmation',
      EmailService._createConfurmationCodeMailHTML(confirmationCode),
    );
  }

  static _createConfurmationCodeMailHTML = (confirmationCode: string) => {
    return `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`;
  };
}
const emailService = EmailService;

export { emailService };
