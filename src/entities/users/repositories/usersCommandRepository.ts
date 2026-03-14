import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../database/mongoDB';
import { MongoUserType, UserType } from '../types';
import { injectable } from 'inversify';

@injectable()
class UsersCommandRepository {
  async checkUserByLoginOrEmail(login: string, email: string) {
    const documentCount = await usersCollection.countDocuments(
      { $or: [{ login }, { email }] },
      { limit: 1 },
    );
    return Boolean(documentCount);
  }

  async checkUserByLogin(login: string) {
    const documentCount = await usersCollection.countDocuments({ login }, { limit: 1 });
    return Boolean(documentCount);
  }

  async checkUserByEmail(email: string) {
    const documentCount = await usersCollection.countDocuments({ email }, { limit: 1 });
    return Boolean(documentCount);
  }

  async findUserById(userId: string) {
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return foundUser ? this._cleanObjectIdMapper(foundUser) : null;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const foundUser = await usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return foundUser ? this._cleanObjectIdMapper(foundUser) : null;
  }

  async findUserByEmailConfirmationCode(emailConfirmationCode: string) {
    const foundUser = await usersCollection.findOne({
      'emailConfirmation.code': emailConfirmationCode,
    });
    return foundUser ? this._cleanObjectIdMapper(foundUser) : null;
  }

  async confirmEmail(email: string) {
    const updateResult = await usersCollection.updateOne(
      { email },
      {
        $set: {
          'emailConfirmation.isConfirmed': true,
        },
      },
    );

    return updateResult.matchedCount === 1;
  }

  async save(user: MongoUserType) {
    const { insertedId } = await usersCollection.insertOne(user);
    return insertedId.toString();
  }

  async deleteUser(userId: string) {
    const { deletedCount } = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return Boolean(deletedCount);
  }

  async updateEmailConfirmationCode(userId: string, code: string, codeExpirationDate: string) {
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          emailConfirmation: {
            isConfirmed: false,
            code,
            codeExpirationDate,
          },
        },
      },
    );

    return updateResult.matchedCount === 1;
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    const updateResult = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordHash } });
    return updateResult.matchedCount === 1;
  }

  async cleanAll() {
    await usersCollection.deleteMany();
  }

  private _cleanObjectIdMapper(mongoUser: WithId<MongoUserType>): UserType {
    return {
      id: mongoUser._id.toString(),
      email: mongoUser.email,
      login: mongoUser.login,
      createdAt: mongoUser.createdAt,
      passwordHash: mongoUser.passwordHash,
      emailConfirmation: {
        isConfirmed: mongoUser.emailConfirmation.isConfirmed,
        code: mongoUser.emailConfirmation.code,
        codeExpirationDate: mongoUser.emailConfirmation.codeExpirationDate,
      },
    };
  }
}

export { UsersCommandRepository };
