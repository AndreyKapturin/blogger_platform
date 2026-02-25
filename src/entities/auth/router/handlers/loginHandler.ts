import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { AccessToken, InputLoginType } from '../../types';
import { authService } from '../../application/authService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const loginHandler = async (
  req: RequestWithBody<InputLoginType>,
  res: Response<AccessToken | APIErrorResult>,
) => {
  const loginResult = await authService.login(req.body);

  if (isWrongResult(loginResult)) {
    sendHttpResponseIfWrongResult(loginResult, res);
    return;
  }

  res.cookie('refreshToken', loginResult.data.refreshToken, { httpOnly: true, secure: true });
  res.status(HttpStatus.Ok).json({ accessToken: loginResult.data.accessToken });
};

export { loginHandler };
