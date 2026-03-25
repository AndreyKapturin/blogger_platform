import { injectable } from 'inversify';
import { UserDocumentType, UserModel } from '../domain/UserModel';

@injectable()
class UsersCommandRepository {
  async checkByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const documentCount = await UserModel.countDocuments(
      { $or: [{ login }, { email }] },
      { limit: 1 },
    );
    return Boolean(documentCount);
  }

  async checkByLogin(login: string): Promise<boolean> {
    const documentCount = await UserModel.countDocuments({ login }, { limit: 1 });
    return Boolean(documentCount);
  }

  async checkByEmail(email: string): Promise<boolean> {
    const documentCount = await UserModel.countDocuments({ email }, { limit: 1 });
    return Boolean(documentCount);
  }

  async findById(id: string): Promise<UserDocumentType | null> {
    return UserModel.findById(id);
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocumentType | null> {
    return UserModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });
  }

  async findByEmailConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<UserDocumentType | null> {
    return UserModel.findOne({ 'emailConfirmation.code': emailConfirmationCode });
  }

  async save(newUserDocument: UserDocumentType): Promise<string> {
    const savedUserDocument = await newUserDocument.save();
    return savedUserDocument.id;
  }

  async update(updatedUserDocument: UserDocumentType): Promise<boolean> {
    await updatedUserDocument.save();
    return true;
  }

  async delete(userDocument: UserDocumentType): Promise<boolean> {
    const deleteResult = await userDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }

  async cleanAll(): Promise<void> {
    await UserModel.deleteMany();
  }
}

export { UsersCommandRepository };
