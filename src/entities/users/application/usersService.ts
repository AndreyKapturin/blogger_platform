import { UsersCommandRepository } from '../repositories/usersCommandRepository';
import { InputUserType } from '../types';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { inject, injectable } from 'inversify';
import { UserModel } from '../domain/UserModel';
import { CryptoService } from '../../../core/utils/crypto/passwordUtils';

@injectable()
class UsersService {
  constructor(
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
    @inject(CryptoService)
    private cryptoService: CryptoService,
  ) {}

  async createUser(credentials: InputUserType): Promise<Result<string>> {
    const isUserExist = await this.usersCommandRepository.checkByLoginOrEmail(
      credentials.login,
      credentials.email,
    );

    if (isUserExist) {
      return ResultFactory.wrong(ResultStatus.InvalidData, 'User already exist', [
        {
          field: null,
          message: 'User with passed credentials already exist',
        },
      ]);
    }

    const passwordHash = await this.cryptoService.hashPassword(credentials.password);

    const newUser = new UserModel({
      login: credentials.login,
      email: credentials.email,
      emailConfirmation: {
        isConfirmed: true,
        code: '',
        codeExpirationDate: new Date(),
      },
      passwordHash,
    });

    const userId = await this.usersCommandRepository.save(newUser);

    return ResultFactory.success(userId);
  }
  
  async deleteUserById(id: string): Promise<Result> {
    const userDocument = await this.usersCommandRepository.findById(id);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'User not found', [
        {
          field: 'id',
          message: `User not found by ${id} id`,
        },
      ]);
    }

    await this.usersCommandRepository.delete(userDocument);

    return ResultFactory.success(null);
  }
}

export { UsersService };
