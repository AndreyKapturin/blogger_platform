import { ObjectId } from 'mongodb';
import { usersCollection } from '../../../../database/mongoDB';
import { UserType } from '../../types';

const checkUserByIdOrLogin = async (login: string, email: string) => {
  const documentCount = await usersCollection.countDocuments({ login, email }, { limit: 1 });
  return Boolean(documentCount);
};

const save = async (user: UserType) => {
  const { insertedId } = await usersCollection.insertOne(user);
  return insertedId.toString();
}

const deleteUser = async (userId: string) => {
  const { deletedCount } = await usersCollection.deleteOne({ _id: new ObjectId(userId)});
  return Boolean(deletedCount);
}

const cleanAll = async () => {
  await usersCollection.deleteMany();
};

const usersRepository = {
  checkUserByIdOrLogin,
  save,
  deleteUser,
  cleanAll,
};

export { usersRepository };
