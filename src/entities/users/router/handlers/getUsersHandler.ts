import { Response } from 'express';
import { RequestWithQuery } from '../../../../core/types/RequestTypes';
import { ViewUsersQuery, ViewUserType } from '../../types';
import { Paginator } from '../../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { usersQueryRepository } from '../../repositories/queryRepositury/queryRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const getUsersHandler = async (
  req: RequestWithQuery<ViewUsersQuery>,
  res: Response<Paginator<ViewUserType>>,
) => {
  const cleanQuery = matchedData<ViewUsersQuery>(req, { locations: ['query'] });
  const paginatedUsers = await usersQueryRepository.getPaginatedUsers(cleanQuery);
  res.status(HttpStatus.Ok).json(paginatedUsers);
};

export { getUsersHandler };
