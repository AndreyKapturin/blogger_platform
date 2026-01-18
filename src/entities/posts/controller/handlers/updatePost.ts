import { Response } from 'express';
import { RequestWithParamsAndBody } from '../../../../core/types/RequestTypes';
import { InputPostType, PostIdParamType } from '../../types';
import { APIErrorResult } from '../../../../core/validation/APIErrorResult';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsRepository } from '../../../blogs/repository/blogsRepository';

const updatePost = async (
  req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
  res: Response<APIErrorResult>
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

  const updatedPost: InputPostType = {
    title: req.body.title,
    content: req.body.content,
    shortDescription: req.body.shortDescription,
    blogId: blog._id.toString(),
  };

  const wasUpdated = await postsRepository.update(req.params.id, updatedPost);
  res.sendStatus(wasUpdated ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

export { updatePost };
