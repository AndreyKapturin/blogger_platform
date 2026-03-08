import { Filter, ObjectId, WithId } from 'mongodb';
import { usersCollection } from '../../../database/mongoDB';
import { MongoUserType, UserMeType, ViewUsersQuery, ViewUserType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';

class UsersQueryRepository {
  static async getPaginatedUsers(usersQuery: ViewUsersQuery) {
    const filter: Filter<MongoUserType> = {};
    const { sortBy, sortDirection, searchLoginTerm, searchEmailTerm, pageNumber, pageSize } =
      usersQuery;
    const skip = (pageNumber - 1) * pageSize;

    if (searchLoginTerm || searchEmailTerm) {
      filter.$or = [];
      if (searchLoginTerm) {
        filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
      }
      if (searchEmailTerm) {
        filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
      }
    }

    const foundUsers = await usersCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await usersCollection.countDocuments(filter);

    const viewUsers = foundUsers.map(UsersQueryRepository._userToViewMapper);
    const paginatedUsers = toPaginateMapper(viewUsers, usersQuery, totalCount);

    return paginatedUsers;
  }

  static async findUserById(userId: string) {
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!foundUser) return null;
    return UsersQueryRepository._userToViewMapper(foundUser);
  }

  static async findMe(userId: string) {
    const foundUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!foundUser) return null;
    return UsersQueryRepository._userToMeViewMapper(foundUser);
  }

  static _userToMeViewMapper(mongoUser: WithId<MongoUserType>): UserMeType {
    return {
      userId: mongoUser._id.toString(),
      email: mongoUser.email,
      login: mongoUser.login,
    };
  }

  static _userToViewMapper(mongoUser: WithId<MongoUserType>): ViewUserType {
    return {
      id: mongoUser._id.toString(),
      email: mongoUser.email,
      login: mongoUser.login,
      createdAt: mongoUser.createdAt,
    };
  }
}

const usersQueryRepository = UsersQueryRepository;

export { usersQueryRepository };
