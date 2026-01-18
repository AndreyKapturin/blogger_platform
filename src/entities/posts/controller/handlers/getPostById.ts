import { Response } from 'express';
import { RequestWithParams } from '../../../../core/types/RequestTypes';
import { PostIdParamType, ViewPostType } from '../../types';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsRepository } from '../../../blogs/repository/blogsRepository';
import { postToViewMapper } from '../utils/postToViewMapper';

const getPostById = async (
  req: RequestWithParams<PostIdParamType>,
  res: Response<ViewPostType>
) => {
  const foundPost = await postsRepository.findById(req.params.id);
  if (!foundPost) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  const blog = await blogsRepository.findById(foundPost.blogId);
  const blogName = blog ? blog.name : 'Blog does not exist';
  res.status(HttpStatus.Ok).json(postToViewMapper(foundPost, blogName));
};

export { getPostById };
