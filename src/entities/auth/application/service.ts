import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/types/Result';
import { InputLoginType } from '../types';
import { comparePassword } from '../../../core/utils/crypto/passwordUtils';

const login = async (credentials: InputLoginType): Promise<Result> => {
  const user = await usersCommandRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

  if (!user) {
    return {
      status: ResultStatus.InvalidCredentials,
      errorMessage: 'Invalid credentials',
      extensions: [
        {
          field: null,
          message: 'Invalid credentials',
        },
      ],
    };
  }

  const isValidPassword = await comparePassword(credentials.password, user.passwordHash);

  if (!isValidPassword) {
    return {
      status: ResultStatus.InvalidCredentials,
      errorMessage: 'Invalid credentials',
      extensions: [
        {
          field: null,
          message: 'Invalid credentials',
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

const authService = {
  login,
};

export { authService };
