import { Response } from 'express';
import { RequestWithBody } from '../../../../core/types/RequestTypes';
import { InputPostType, PostType, ViewPostType } from '../../types';
import { APIErrorResult } from '../../../../core/validation/APIErrorResult';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { postsRepository } from '../../repository/postsRepository';
import { blogsRepository } from '../../../blogs/repository/blogsRepository';
import { postToViewMapper } from '../utils/postToViewMapper';

const createPost = async (
  req: RequestWithBody<InputPostType>,
  res: Response<ViewPostType | APIErrorResult>
) => {
  const blog = await blogsRepository.findById(req.body.blogId);
  if (!blog) {
    res.status(HttpStatus.Bad_Request).json({
      errorsMessages: [
        {
          field: 'blogId',
          message: `Blog not found by ${req.body.blogId} id`,
        },
      ],
    });
    return;
  }

  const newPost: PostType = {
    title: req.body.title,
    content: req.body.content,
    shortDescription: req.body.shortDescription,
    createdAt: new Date().toISOString(),
    blogId: blog._id.toString(),
    blogName: blog.name,
  };

  const createdPost = await postsRepository.save(newPost);

  res.status(HttpStatus.Created).json(postToViewMapper(createdPost));
};

export { createPost };
