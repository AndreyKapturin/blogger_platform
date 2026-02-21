import { Request, Response } from 'express';
import { AccessToken } from '../../types';
import { authService } from '../../application/authService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';

const refreshTokensHandler = async (req: Request, res: Response<AccessToken | APIErrorResult>) => {
  const updateTokensResult = await authService.refreshTokens(req.cookies.refreshToken);

  if (updateTokensResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(updateTokensResult.status))
      .json(extensionResultToAPIError(updateTokensResult.extensions));
    return;
  }

  res.cookie('refreshToken', updateTokensResult.data.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  
  res.status(HttpStatus.Ok).json({ accessToken: updateTokensResult.data.accessToken });
};

export { refreshTokensHandler };
