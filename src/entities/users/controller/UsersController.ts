import { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
} from '../../../core/types/RequestTypes';
import { InputUserType, UserIdParamType, ViewUsersQuery, ViewUserType } from '../types';
import { APIErrorResult } from '../../../core/types/APIErrorResult';
import { UsersService } from '../application/usersService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { UsersQueryRepository } from '../repositories/usersQueryRepository';
import { Paginator } from '../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';

class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async createUser(
    req: RequestWithBody<InputUserType>,
    res: Response<ViewUserType | APIErrorResult>,
  ) {
    const createUserResult = await this.usersService.createUser(req.body);

    if (isWrongResult(createUserResult)) {
      sendHttpResponseIfWrongResult(createUserResult, res);
      return;
    }

    const createdUser = await this.usersQueryRepository.findUserById(createUserResult.data);
    res.status(HttpStatus.Created).json(createdUser!);
  }

  async getUsers(req: RequestWithQuery<ViewUsersQuery>, res: Response<Paginator<ViewUserType>>) {
    const cleanQuery = matchedData<ViewUsersQuery>(req, { locations: ['query'] });
    const paginatedUsers = await this.usersQueryRepository.getPaginatedUsers(cleanQuery);
    res.status(HttpStatus.Ok).json(paginatedUsers);
  }

  async deleteUser(req: RequestWithParams<UserIdParamType>, res: Response) {
    const deleteUserResult = await this.usersService.deleteUserById(req.params.id);

    if (isWrongResult(deleteUserResult)) {
      sendHttpResponseIfWrongResult(deleteUserResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { UsersController };
