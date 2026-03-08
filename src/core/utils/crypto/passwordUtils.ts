import { compare, genSalt, hash } from 'bcrypt';

class CryptoService {
  static async hashPassword(rawPassword: string, saltRounds = 10): Promise<string> {
    const salt = await genSalt(saltRounds);
    const passwordHash = await hash(rawPassword, salt);
    return passwordHash;
  }

  static async comparePassword(rawPassword: string, passwordHash: string): Promise<boolean> {
    return await compare(rawPassword, passwordHash);
  }
}

const cryptoService = CryptoService;

export { cryptoService };
