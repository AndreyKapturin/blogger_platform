import { PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS } from '../../core/config';

class RecoveryCode {
  public readonly code: string;
  public readonly expirationDate: Date;
  public readonly userId: string;

  constructor(userId: string) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + PASSWORD_RECOVERY_CODE_LIFETIME_IN_SECONDS);

    ((this.code = crypto.randomUUID()), (this.expirationDate = date));
    this.userId = userId;
  }
}

export { RecoveryCode };
