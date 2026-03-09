import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputBlogType, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { blogsQueryRepository, blogsService } from '../../../../compositionRoot';

const createBlogHandler = async (
  req: RequestWithBody<InputBlogType>,
  res: Response<ViewBlogType | APIErrorResult>,
) => {
  const createBlogResult = await blogsService.createBlog(req.body);

  if (isWrongResult(createBlogResult)) {
    sendHttpResponseIfWrongResult(createBlogResult, res);
    return;
  }

  const blog = await blogsQueryRepository.findById(createBlogResult.data);
  res.status(HttpStatus.Created).json(blog!);
};

export { createBlogHandler };
