import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { UserIdParamType } from '../../types';
import { usersService } from '../../application/usersService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';

const deleteUserHandler = async (req: RequestWithParams<UserIdParamType>, res: Response) => {
  const deleteUserResult = await usersService.deleteUserById(req.params.id);

  if (deleteUserResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(deleteUserResult.status))
      .json(extensionResultToAPIError(deleteUserResult.extensions));
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteUserHandler };
