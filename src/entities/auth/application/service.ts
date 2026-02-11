import { usersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { Result, ResultStatus } from '../../../core/types/Result';
import { InputLoginType } from '../types';
import { comparePassword } from '../../../core/utils/crypto/passwordUtils';
import { createAccessToken } from '../../../core/utils/jwt/jwtUtils';

const login = async (credentials: InputLoginType): Promise<Result<string>> => {
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

  const accessToken = await createAccessToken({ userId: user.id });

  return {
    status: ResultStatus.Success,
    data: accessToken,
    extensions: [],
  };
};

const authService = {
  login,
};

export { authService };
