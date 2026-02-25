import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputUserType, ViewUserType } from '../../types';
import { usersService } from '../../application/usersService';
import { usersQueryRepository } from '../../repositories/usersQueryRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const createUserHandler = async (
  req: RequestWithBody<InputUserType>,
  res: Response<ViewUserType | APIErrorResult>,
) => {
  const createUserResult = await usersService.createUser(req.body);

  if (isWrongResult(createUserResult)) {
    sendHttpResponseIfWrongResult(createUserResult, res);
    return;
  }

  const createdUser = await usersQueryRepository.findUserById(createUserResult.data);
  res.status(HttpStatus.Created).json(createdUser!);
};

export { createUserHandler };
