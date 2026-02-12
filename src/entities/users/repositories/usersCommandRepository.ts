import { ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../database/mongoDB';
import { MongoUserType, UserType } from '../types';

const checkUserByLoginOrEmail = async (login: string, email: string) => {
  const documentCount = await usersCollection.countDocuments({ login, email }, { limit: 1 });
  return Boolean(documentCount);
};

const findUserById = async (userId: string) => {
  const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
  return foundUser ? _cleanObjectIdMapper(foundUser) : null;
};

const findUserByLoginOrEmail = async (loginOrEmail: string) => {
  const foundUser = await usersCollection.findOne({
    $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  });
  return foundUser ? _cleanObjectIdMapper(foundUser) : null;
};

const save = async (user: MongoUserType) => {
  const { insertedId } = await usersCollection.insertOne(user);
  return insertedId.toString();
};

const deleteUser = async (userId: string) => {
  const { deletedCount } = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
  return Boolean(deletedCount);
};

const cleanAll = async () => {
  await usersCollection.deleteMany();
};

const _cleanObjectIdMapper = (mongoUser: WithId<MongoUserType>): UserType => {
  return {
    id: mongoUser._id.toString(),
    email: mongoUser.email,
    login: mongoUser.login,
    createdAt: mongoUser.createdAt,
    passwordHash: mongoUser.passwordHash,
  };
};

const usersCommandRepository = {
  checkUserByLoginOrEmail,
  findUserById,
  findUserByLoginOrEmail,
  save,
  deleteUser,
  cleanAll,
};

export { usersCommandRepository };
