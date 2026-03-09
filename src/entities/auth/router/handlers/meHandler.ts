import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { UserMeType } from '../../../users/types';
import { usersQueryRepository } from '../../../../compositionRoot';

const meHandler = async (req: Request, res: Response<UserMeType>) => {
  const foundUser = await usersQueryRepository.findMe(req.user!.userId);
  
  if (!foundUser) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  res.status(HttpStatus.Ok).json(foundUser);
};

export { meHandler };
