import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

type UserIdParamType = {
  id: string;
};

type MongoUserType = {
  login: string;
  email: string;
  createdAt: string;
  passwordHash: string;
};

type UserType = MongoUserType & UserIdParamType;

type InputUserType = {
  login: string;
  password: string;
  email: string;
};

type ViewUserType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

enum UsersSortFields {
  Login = 'login',
  CreatedAt = 'createdAt',
}

type ViewUsersQuery = PaginationAndSortQuery<UsersSortFields> & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export { UsersSortFields };
export type { UserIdParamType, MongoUserType, InputUserType, ViewUsersQuery, ViewUserType, UserType };
