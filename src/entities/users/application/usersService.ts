import { usersCommandRepository } from '../repositories/usersCommandRepository';
import { InputUserType } from '../types';
import { Result, ResultStatus } from '../../../core/types/Result';
import { UserFactory } from '../UserFactory';

const createUser = async (credentials: InputUserType): Promise<Result<string>> => {
  const isUserExist = await usersCommandRepository.checkUserByLoginOrEmail(
    credentials.login,
    credentials.email,
  );

  if (isUserExist) {
    return {
      status: ResultStatus.InvalidData,
      extensions: [
        {
          field: null,
          message: 'User with passed credentials already exists',
        },
      ],
    };
  }

  const user = await UserFactory.createConfirmedUser(
    credentials.email,
    credentials.login,
    credentials.password,
  )

  const userId = await usersCommandRepository.save(user);
  
  return {
    status: ResultStatus.Success,
    data: userId,
    extensions: [],
  };
};

const deleteUserById = async (userId: string): Promise<Result> => {
  const isDeletedUser = await usersCommandRepository.deleteUser(userId);

  if (!isDeletedUser) {
    return {
      status: ResultStatus.NotFound,
      errorMessage: `User not found by ${userId} id`,
      extensions: [
        {
          field: 'id',
          message: `User not found by ${userId} id`,
        },
      ],
    };
  }

  return {
    status: ResultStatus.Success,
    data: null,
    extensions: [],
  };
};

const usersService = {
  createUser,
  deleteUserById,
};

export { usersService };
