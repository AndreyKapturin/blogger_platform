import { sendEmail } from '../utils/email/emailUtils';

class EmailService {
  async sendConfirmationCode(recipientAddress: string, confirmationCode: string) {
    return sendEmail(
      recipientAddress,
      'Email confirmation',
      this._createConfurmationCodeMailHTML(confirmationCode),
    );
  }

  async sendPasswordRecoveryCode(recipientAddress: string, recoveryCode: string) {
    return sendEmail(
      recipientAddress,
      'Recovery password',
      this._createPasswordRecoveryCodeMailHTML(recoveryCode),
    );
  }

  private _createConfurmationCodeMailHTML(confirmationCode: string) {
    return `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`;
  }

  private _createPasswordRecoveryCodeMailHTML(recoveryCode: string) {
    return `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`;
  }
}

export { EmailService };
