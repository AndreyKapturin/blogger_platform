import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

type UserIdParamType = {
  id: string;
};

type EmailConfirmationType = {
  isConfirmed: boolean;
  code: string;
  codeExpirationDate: Date;
};

type MongoUserType = {
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
  emailConfirmation: EmailConfirmationType;
};

type UserType = MongoUserType;

type UserMeType = {
  login: string;
  email: string;
  userId: string;
};

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
export type {
  EmailConfirmationType,
  UserIdParamType,
  MongoUserType,
  InputUserType,
  ViewUsersQuery,
  ViewUserType,
  UserType,
  UserMeType,
};
