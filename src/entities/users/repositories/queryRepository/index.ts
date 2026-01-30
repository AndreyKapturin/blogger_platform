import { Filter, ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../../database/mongoDB';
import { UserType, ViewUsersQuery, ViewUserType } from '../../types';
import { toPaginateMapper } from '../../../../core/mappers/toPaginateMapper';

const getPaginatedUsers = async (usersQuery: ViewUsersQuery) => {
  const filter: Filter<UserType> = {};
  const { sortBy, sortDirection, searchLoginTerm, searchEmailTerm, pageNumber, pageSize } =
    usersQuery;
  const skip = (pageNumber - 1) * pageSize;

  if (searchLoginTerm) {
    filter.login = { $regExp: searchLoginTerm, options: 'i' };
  }

  if (searchEmailTerm) {
    filter.email = { $regExp: searchEmailTerm, options: 'i' };
  }

  const foundUsers = await usersCollection
    .find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const totalCount = await usersCollection.countDocuments(filter);

  const viewUsers = foundUsers.map(_userToViewMapper);
  const paginatedUsers = toPaginateMapper(viewUsers, usersQuery, totalCount);

  return paginatedUsers;
};

const findUserById = async (userId: string) => {
  const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!foundUser) return null;
  return _userToViewMapper(foundUser);
};

const _userToViewMapper = (mongoUser: WithId<UserType>): ViewUserType => {
  return {
    id: mongoUser._id.toString(),
    email: mongoUser.email,
    login: mongoUser.login,
    createdAt: mongoUser.createdAt,
  };
};

const usersQueryRepository = {
  getPaginatedUsers,
  findUserById,
};

export { usersQueryRepository };
