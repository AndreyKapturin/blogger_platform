import { cryptoService } from '../../compositionRoot';
import { dateUtils } from '../../core/utils/date/dateUtils';
import { MongoUserType } from './types';

class UserFactory {
  static async createConfirmedUser(
    email: string,
    login: string,
    rawPassword: string,
  ): Promise<MongoUserType> {
    const passwordHash = await cryptoService.hashPassword(rawPassword);
    const createdAt = new Date().toISOString();
    return {
      email,
      login,
      passwordHash,
      createdAt,
      emailConfirmation: {
        isConfirmed: true,
        code: '',
        codeExpirationDate: createdAt,
      },
    };
  }

  static async createUnconfirmedUser(
    email: string,
    login: string,
    rawPassword: string,
  ): Promise<MongoUserType> {
    const passwordHash = await cryptoService.hashPassword(rawPassword);
    return {
      email,
      login,
      passwordHash,
      createdAt: dateUtils.getCreatedAtDate(),
      emailConfirmation: {
        isConfirmed: false,
        code: crypto.randomUUID(),
        codeExpirationDate: dateUtils.getEmailConfirmationCodeExpirationDate(),
      },
    };
  }
}

export { UserFactory };
