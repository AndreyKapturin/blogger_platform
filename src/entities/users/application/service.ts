import { genSalt, hash } from 'bcrypt';
import { BusinessLogicError } from '../../../core/errors/BusinessLogicError';
import { ResourceNotFoundError } from '../../../core/errors/ResourceNotFoundError';
import { usersRepository } from '../repositories/commandRepository';
import { InputUserType, UserType } from '../types';

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

const deleteUserById = async (userId: string) => {
  const isDeletedUser = await usersRepository.deleteUser(userId);
  if (!isDeletedUser) throw new ResourceNotFoundError(`User not found by ${userId} id`);
  return true;
}

const usersService = {
  createUser,
  deleteUserById,
};

export { usersService };
