import { BusinessLogicError } from '../../../core/errors/BusinessLogicError';
import { usersRepository } from '../repositories/commandRepository';
import { InputUserType, UserType } from '../types';
import { hash, genSalt } from 'bcrypt';

const createUser = async (inputUser: InputUserType) => {
  const isUserExist = await usersRepository.checkUserByIdOrLogin(inputUser.login, inputUser.email);
  if (isUserExist) throw new BusinessLogicError('Login or email is busy');

  const salt = await genSalt(10);
  const passwordHash = await hash(inputUser.password, salt);

  const user: UserType = {
    email: inputUser.email,
    login: inputUser.login,
    passwordHash,
    createdAt: (new Date).toISOString()
  }

  const userId = await usersRepository.save(user);
  return userId;
};

const usersService = {
  createUser,
};

export { usersService };
