import { Request, Response } from 'express';
import { AccessToken } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { authService } from '../../../../compositionRoot';

const refreshTokensHandler = async (req: Request, res: Response<AccessToken | APIErrorResult>) => {
  const updateTokensResult = await authService.refreshTokens(req.cookies.refreshToken);

  if (isWrongResult(updateTokensResult)) {
    sendHttpResponseIfWrongResult(updateTokensResult, res);
    return;
  }

  res.cookie('refreshToken', updateTokensResult.data.refreshToken, {
    httpOnly: true,
    secure: true,
  });

  res.status(HttpStatus.Ok).json({ accessToken: updateTokensResult.data.accessToken });
};

export { refreshTokensHandler };
