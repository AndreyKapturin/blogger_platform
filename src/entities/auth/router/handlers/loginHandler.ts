import { Response } from "express";
import { RequestWithBody } from "../../../../core/types/RequestTypes";
import { InputLoginType } from "../../types";
import { authService } from "../../application/service";
import { HttpStatus } from "../../../../core/types/HttpStatus";

const loginHandler = async (
  req: RequestWithBody<InputLoginType>,
  res: Response
) => {
  const isSuccessLogin = await authService.login(req.body);
  res.sendStatus(isSuccessLogin ? HttpStatus.No_Content : HttpStatus.Unauthorized);
};

export { loginHandler };
