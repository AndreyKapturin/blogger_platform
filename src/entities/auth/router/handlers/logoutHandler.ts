import { Request, Response } from 'express';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { authService } from '../../application/authService';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { HttpStatus } from '../../../../core/types/HttpStatus';

const logoutHandler = async (req: Request, res: Response<APIErrorResult>) => {
  const logoutResult = await authService.logout(req.cookies.refreshToken);

  if (logoutResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(logoutResult.status))
      .json(extensionResultToAPIError(logoutResult.extensions));
    return;
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.sendStatus(HttpStatus.No_Content)
};

export { logoutHandler };
