import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputBlogPostType, InputPostType, ViewPostType } from '../../../posts/types';
import { BlogIdParamType } from '../../types';
import { postsService } from '../../../posts/application/service';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postToViewMapper } from '../../../posts/controller/mappers/postToViewMapper';

const createPostForBlog = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogPostType>,
  res: Response<ViewPostType>,
) => {
  const inputPost: InputPostType = {
    ...req.body,
    blogId: req.params.id,
  };
  const createdPost = await postsService.createPost(inputPost);
  res.status(HttpStatus.Created).json(postToViewMapper(createdPost));
};

export { createPostForBlog };
