import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../database/mongoDB';
import { MongoUserType, UserType } from '../types';

class UsersCommandRepository {
  static async checkUserByLoginOrEmail(login: string, email: string) {
    const documentCount = await usersCollection.countDocuments(
      { $or: [{ login }, { email }] },
      { limit: 1 },
    );
    return Boolean(documentCount);
  }

  static async checkUserByLogin(login: string) {
    const documentCount = await usersCollection.countDocuments({ login }, { limit: 1 });
    return Boolean(documentCount);
  }

  static async checkUserByEmail(email: string) {
    const documentCount = await usersCollection.countDocuments({ email }, { limit: 1 });
    return Boolean(documentCount);
  }

  static async findUserById(userId: string) {
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return foundUser ? UsersCommandRepository._cleanObjectIdMapper(foundUser) : null;
  }

  static async findUserByLoginOrEmail(loginOrEmail: string) {
    const foundUser = await usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return foundUser ? UsersCommandRepository._cleanObjectIdMapper(foundUser) : null;
  }

  static async findUserByEmailConfirmationCode(emailConfirmationCode: string) {
    const foundUser = await usersCollection.findOne({
      'emailConfirmation.code': emailConfirmationCode,
    });
    return foundUser ? UsersCommandRepository._cleanObjectIdMapper(foundUser) : null;
  }

  static async confirmEmail(email: string) {
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

  static async save(user: MongoUserType) {
    const { insertedId } = await usersCollection.insertOne(user);
    return insertedId.toString();
  }

  static async deleteUser(userId: string) {
    const { deletedCount } = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return Boolean(deletedCount);
  }

  static async updateEmailConfirmationCode(
    userId: string,
    code: string,
    codeExpirationDate: string,
  ) {
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

  static async cleanAll() {
    await usersCollection.deleteMany();
  }

  static _cleanObjectIdMapper(mongoUser: WithId<MongoUserType>): UserType {
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
const usersCommandRepository = UsersCommandRepository;

export { usersCommandRepository };
