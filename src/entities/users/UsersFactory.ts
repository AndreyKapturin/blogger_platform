import { inject, injectable } from 'inversify';
import { dateUtils } from '../../core/utils/date/dateUtils';
import { MongoUserType } from './types';
import { CryptoService } from '../../core/utils/crypto/passwordUtils';

@injectable()
class UsersFactory {
  constructor(
    @inject(CryptoService)
    private cryptoService: CryptoService,
  ) {}

  async createConfirmedUser(
    email: string,
    login: string,
    rawPassword: string,
  ): Promise<MongoUserType> {
    const passwordHash = await this.cryptoService.hashPassword(rawPassword);
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

  async createUnconfirmedUser(
    email: string,
    login: string,
    rawPassword: string,
  ): Promise<MongoUserType> {
    const passwordHash = await this.cryptoService.hashPassword(rawPassword);
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

export { UsersFactory };
