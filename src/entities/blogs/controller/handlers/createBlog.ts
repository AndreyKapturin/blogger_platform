import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputBlogType, ViewBlogType } from '../../types';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsService } from '../../application/blogsService';
import { blogsQueryRepository } from '../../repositories/blogsQueryRepository';
import { ResultStatus } from '../../../../core/types/Result';
import { resultStatusToHttpStatus } from '../../../../core/mappers/resultStatusToHttpStatus';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { extensionResultToAPIError } from '../../../../core/mappers/extensionResultToAPIError';

const createBlog = async (
  req: RequestWithBody<InputBlogType>,
  res: Response<ViewBlogType | APIErrorResult>,
) => {
  const createBlogResult = await blogsService.createBlog(req.body);

  if (createBlogResult.status !== ResultStatus.Success) {
    res
      .status(resultStatusToHttpStatus(createBlogResult.status))
      .json(extensionResultToAPIError(createBlogResult.extensions));
    return;
  }
  
  const blog = await blogsQueryRepository.findById(createBlogResult.data);
  res.status(HttpStatus.Created).json(blog!);
};

export { createBlog };
