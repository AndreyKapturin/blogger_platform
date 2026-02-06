import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputUserType, ViewUserType } from '../../types';
import { usersService } from '../../application/usersService';
import { usersQueryRepository } from '../../repositories/usersQueryRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { ResultStatus } from '../../../../core/types/Result';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';

const createUserHandler = async (
  req: RequestWithBody<InputUserType>,
  res: Response<ViewUserType | APIErrorResult>,
) => {
  const createUserResult = await usersService.createUser(req.body);

  if (createUserResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(createUserResult.status))
      .json(extensionResultToAPIError(createUserResult.extensions));
    return;
  }

  const createdUser = await usersQueryRepository.findUserById(createUserResult.data);
  res.status(HttpStatus.Created).json(createdUser!);
};

export { createUserHandler };
