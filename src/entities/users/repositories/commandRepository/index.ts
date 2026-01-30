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

const cleanAll = async () => {
  await usersCollection.deleteMany();
};

const usersRepository = {
  checkUserByIdOrLogin,
  save,
  cleanAll,
};

export { usersRepository };
