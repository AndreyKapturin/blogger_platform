import { hashPassword } from '../../core/utils/crypto/passwordUtils';
import { MongoUserType } from './types';

class UserFactory {
  static async createConfirmedUser(
    email: string,
    login: string,
    rawPassword: string,
  ): Promise<MongoUserType> {
    const passwordHash = await hashPassword(rawPassword);
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
    const passwordHash = await hashPassword(rawPassword);
    const nowDate = new Date();
    const createdAt = nowDate.toISOString();
    nowDate.setHours(nowDate.getHours() + 1);
    const codeExpirationDate = nowDate.toISOString();
    return {
      email,
      login,
      passwordHash,
      createdAt,
      emailConfirmation: {
        isConfirmed: false,
        code: crypto.randomUUID(),
        codeExpirationDate,
      },
    };
  }
}

export { UserFactory };
