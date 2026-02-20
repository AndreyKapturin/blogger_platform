import { revokedRefreshTokensCollection } from '../../../database/mongoDB';
import { MongoRevokedRefreshToken } from '../types';

const checkTokenInRevokedList = async (refreshToken: string) => {
  const tokensCount = await revokedRefreshTokensCollection.countDocuments(
    { token: refreshToken },
    { limit: 1 },
  );
  return Boolean(tokensCount);
};

const saveRevokedRefreshToken = async (revokedRefreshToken: MongoRevokedRefreshToken) => {
  const { insertedId } = await revokedRefreshTokensCollection.insertOne(revokedRefreshToken);
  return insertedId.toString();
};

const cleanAll = async () => {
  await revokedRefreshTokensCollection.deleteMany();
};

const refreshTokenCommandRepository = {
  checkTokenInRevokedList,
  saveRevokedRefreshToken,
  cleanAll,
};

export { refreshTokenCommandRepository };
