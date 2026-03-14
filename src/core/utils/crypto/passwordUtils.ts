import { compare, genSalt, hash } from 'bcrypt';
import { injectable } from 'inversify';

@injectable()
class CryptoService {
  async hashPassword(rawPassword: string, saltRounds = 10): Promise<string> {
    const salt = await genSalt(saltRounds);
    const passwordHash = await hash(rawPassword, salt);
    return passwordHash;
  }

  async comparePassword(rawPassword: string, passwordHash: string): Promise<boolean> {
    return await compare(rawPassword, passwordHash);
  }
}

export { CryptoService };
