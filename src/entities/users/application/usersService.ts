import { usersCommandRepository } from '../repositories/usersCommandRepository';
import { InputUserType, UserType } from '../types';
import { Result, ResultStatus } from '../../../core/types/Result';
import { hashPassword } from '../../../core/utils/crypto/passwordUtils';

const createUser = async (inputUser: InputUserType): Promise<Result<string>> => {
  const isUserExist = await usersCommandRepository.checkUserByLoginOrEmail(
    inputUser.login,
    inputUser.email,
  );
  if (isUserExist) {
    return {
      status: ResultStatus.InvalidCredentials,
      extensions: [
        {
          field: null,
          message: 'User with passed credentials already  exists',
        },
      ],
    };
  }

  const passwordHash = await hashPassword(inputUser.password);

  const user: UserType = {
    email: inputUser.email,
    login: inputUser.login,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

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
