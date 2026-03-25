import { UserMeType, UserType, ViewUsersQuery, ViewUserType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { UserLeanDocument, UserModel } from '../domain/UserModel';
import { QueryFilter } from 'mongoose';

@injectable()
class UsersQueryRepository {
  async getPaginatedUsers(usersQuery: ViewUsersQuery) {
    const filter: QueryFilter<UserType> = {};
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

    const foundUsers = await UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .lean();

    const totalCount = await UserModel.countDocuments(filter);

    const viewUsers = foundUsers.map(this._userToViewMapper);
    const paginatedUsers = toPaginateMapper(viewUsers, usersQuery, totalCount);

    return paginatedUsers;
  }

  async findById(id: string) {
    const foundUser = await UserModel.findById(id).lean();
    return foundUser ? this._userToViewMapper(foundUser) : null;
  }

  async findMe(id: string): Promise<UserMeType | null> {
    const userDocument = await UserModel.findById(id).lean();
    return userDocument ? this._userToMeViewMapper(userDocument) : null;
  }

  private _userToMeViewMapper(userLeanDocument: UserLeanDocument): UserMeType {
    return {
      userId: userLeanDocument._id.toString(),
      email: userLeanDocument.email,
      login: userLeanDocument.login,
    };
  }

  private _userToViewMapper(userLeanDocument: UserLeanDocument): ViewUserType {
    return {
      id: userLeanDocument._id.toString(),
      email: userLeanDocument.email,
      login: userLeanDocument.login,
      createdAt: userLeanDocument.createdAt.toISOString(),
    };
  }
}

export { UsersQueryRepository };
