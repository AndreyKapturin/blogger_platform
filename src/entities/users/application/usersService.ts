import { UsersCommandRepository } from '../repositories/usersCommandRepository';
import { InputUserType } from '../types';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { UsersFactory } from '../UsersFactory';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { inject, injectable } from 'inversify';

@injectable()
class UsersService {
  constructor(
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
    @inject(UsersFactory)
    private usersFactory: UsersFactory,
  ) {}
  async createUser(credentials: InputUserType): Promise<Result<string>> {
    const isUserExist = await this.usersCommandRepository.checkUserByLoginOrEmail(
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

    const user = await this.usersFactory.createConfirmedUser(
      credentials.email,
      credentials.login,
      credentials.password,
    );

    const userId = await this.usersCommandRepository.save(user);

    return ResultFactory.success(userId);
  }

  async deleteUserById(userId: string): Promise<Result> {
    const isDeletedUser = await this.usersCommandRepository.deleteUser(userId);

    if (!isDeletedUser) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'User not found', [
        {
          field: 'id',
          message: `User not found by ${userId} id`,
        },
      ]);
    }

    return ResultFactory.success(null);
  }
}

export { UsersService };
