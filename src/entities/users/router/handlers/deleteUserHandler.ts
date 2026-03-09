import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { UserIdParamType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { usersService } from '../../../../compositionRoot';

const deleteUserHandler = async (req: RequestWithParams<UserIdParamType>, res: Response) => {
  const deleteUserResult = await usersService.deleteUserById(req.params.id);

  if (isWrongResult(deleteUserResult)) {
    sendHttpResponseIfWrongResult(deleteUserResult, res);
    return;
  }

  res.sendStatus(HttpStatus.No_Content);
};

export { deleteUserHandler };
