import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputUserType, ViewUserType } from '../../types';
import { usersService } from '../../application/service';
import { usersQueryRepository } from '../../repositories/queryRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const createUserHandler = async (
  req: RequestWithBody<InputUserType>,
  res: Response<ViewUserType>,
) => {
  const userId = await usersService.createUser(req.body);
  const createdUser = await usersQueryRepository.findUserById(userId);
  res.status(HttpStatus.Created).json(createdUser!);
};

export { createUserHandler };
