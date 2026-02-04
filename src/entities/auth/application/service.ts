import { usersCommandRepository } from "../../users/repositories/usersCommandRepository";
import { InputLoginType } from "../types";
import {compare} from 'bcrypt';

const login = async (credentials: InputLoginType) => {
  const user = await usersCommandRepository.findUserByLoginOrEmail(credentials.loginOrEmail);
  if (!user) return false;
  const isValidPassword = await compare(credentials.password, user.passwordHash);
  return isValidPassword;
};

const authService = {
  login
};

export { authService };
