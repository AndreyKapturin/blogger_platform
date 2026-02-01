import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { UserIdParamType } from '../../types';
import { usersService } from '../../application/service';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const deleteUserHandler = async (req: RequestWithParams<UserIdParamType>, res: Response) => {
  await usersService.deleteUserById(req.params.id);
  res.sendStatus(HttpStatus.No_Content);
};

export { deleteUserHandler };
