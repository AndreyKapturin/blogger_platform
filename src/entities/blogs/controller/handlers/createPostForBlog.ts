import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputBlogPostType, InputPostType, ViewPostType } from '../../../posts/types';
import { BlogIdParamType } from '../../types';
import { postsService } from '../../../posts/application/postsService';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsQueryRepository } from '../../../posts/repositories/postsQueryRepository';

const createPostForBlog = async (
  req: RequestWithParamsAndBody<BlogIdParamType, InputBlogPostType>,
  res: Response<ViewPostType>,
) => {
  const inputPost: InputPostType = {
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.params.id,
  };
  const createdPostId = await postsService.createPost(inputPost);
  const createdPost = await postsQueryRepository.findById(createdPostId);
  res.status(HttpStatus.Created).json(createdPost!);
};

export { createPostForBlog };
