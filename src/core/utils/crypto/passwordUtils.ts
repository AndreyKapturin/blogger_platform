import { compare, genSalt, hash } from 'bcrypt';

const hashPassword = async (rawPassword: string, saltRounds = 10): Promise<string> => {
  const salt = await genSalt(saltRounds);
  const passwordHash = await hash(rawPassword, salt);
  return passwordHash;
};

const comparePassword = async (rawPassword: string, passwordHash: string): Promise<boolean> => {
  return await compare(rawPassword, passwordHash);
};

export { hashPassword, comparePassword };
