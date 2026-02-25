import { usersCommandRepository } from '../repositories/usersCommandRepository';
import { InputUserType } from '../types';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { UserFactory } from '../UserFactory';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';

const createUser = async (credentials: InputUserType): Promise<Result<string>> => {
  const isUserExist = await usersCommandRepository.checkUserByLoginOrEmail(
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

  const user = await UserFactory.createConfirmedUser(
    credentials.email,
    credentials.login,
    credentials.password,
  );

  const userId = await usersCommandRepository.save(user);

  return ResultFactory.success(userId);
};

const deleteUserById = async (userId: string): Promise<Result> => {
  const isDeletedUser = await usersCommandRepository.deleteUser(userId);

  if (!isDeletedUser) {
    return ResultFactory.wrong(ResultStatus.NotFound, 'User not found', [
      {
        field: 'id',
        message: `User not found by ${userId} id`,
      },
    ]);
  }

  return ResultFactory.success(null);
};

const usersService = {
  createUser,
  deleteUserById,
};

export { usersService };
