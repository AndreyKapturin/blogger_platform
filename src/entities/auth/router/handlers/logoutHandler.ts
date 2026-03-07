import { Request, Response } from 'express';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { authService } from '../../application/authService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';

const logoutHandler = async (req: Request, res: Response<APIErrorResult>) => {
  const logoutResult = await authService.logout(req.cookies.refreshToken);

  if (isWrongResult(logoutResult)) {
    sendHttpResponseIfWrongResult(logoutResult, res);
    return;
  }

  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.sendStatus(HttpStatus.No_Content);
};

export { logoutHandler };
