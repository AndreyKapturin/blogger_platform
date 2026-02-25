import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputBlogPostType, InputPostType, ViewPostType } from '../../../posts/types';
import { BlogIdParamType } from '../../types';
import { postsService } from '../../../posts/application/postsService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsQueryRepository } from '../../../posts/repositories/postsQueryRepository';
import { APIErrorResult } from '../../../../core/types/APIErrorResult';
import { sendHttpResponseIfWrongResult } from '../../../../core/utils/Result';
import { isWrongResult } from '../../../../core/utils/Result/sendHttpResponseIfWrongResult';

const createPostForBlogHandler = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogPostType>,
  res: Response<ViewPostType | APIErrorResult>,
) => {
  const inputPost: InputPostType = {
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.params.id,
  };

  const createdPostResult = await postsService.createPost(inputPost);

  if (isWrongResult(createdPostResult)) {
    sendHttpResponseIfWrongResult(createdPostResult, res);
    return;
  }

  const createdPost = await postsQueryRepository.findById(createdPostResult.data);
  res.status(HttpStatus.Created).json(createdPost!);
};

export { createPostForBlogHandler };
