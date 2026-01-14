import { Request, Response } from 'express';
import { InputPostType, PostIdParamType, PostType, VievPostType } from './types';
import { postsRepository } from './repository';
import { HttpStatus } from '../../core/types/HttpStatus';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from '../../core/types/RequestTypes';
import { blogsRepository } from '../blogs/repository';
import { APIErrorResult } from '../../core/validation/APIErrorResult';

const getPosts = (req: Request, res: Response<VievPostType[]>) => {
  const posts: VievPostType[] = postsRepository.fildAll().map<VievPostType>((post: PostType) => {
    const blog = blogsRepository.findById(post.blogId);
    const blogName = blog ? blog.name : 'Blog does not exist';
    return { ...post, blogName };
  });

  res.status(HttpStatus.Ok).json(posts);
};

const getPostById = (req: RequestWithParams<PostIdParamType>, res: Response<VievPostType>) => {
  const foundPost = postsRepository.findById(req.params.id);
  if (!foundPost) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }
  const blog = blogsRepository.findById(foundPost.blogId);
  const blogName = blog ? blog.name : 'Blog does not exist';
  res.status(HttpStatus.Ok).json({ ...foundPost, blogName });
};

const createPost = (
  req: RequestWithBody<InputPostType>,
  res: Response<VievPostType | APIErrorResult>
) => {
  const blog = blogsRepository.findById(req.body.blogId);
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
    id: crypto.randomUUID().toString(),
    title: req.body.title,
    content: req.body.content,
    shortDescription: req.body.shortDescription,
    blogId: blog.id,
  };

  const createdPost = postsRepository.save(newPost);
  res.status(HttpStatus.Created).json({ ...createdPost, blogName: blog.name });
};

const updatePost = (
  req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
  res: Response<APIErrorResult>
) => {
  const foundPost = postsRepository.findById(req.params.id);
  if (!foundPost) {
    res.sendStatus(HttpStatus.Not_Found);
    return;
  }

  const blog = blogsRepository.findById(req.body.blogId);
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

  const updatedPost: PostType = {
    id: foundPost.id,
    title: req.body.title,
    content: req.body.content,
    shortDescription: req.body.shortDescription,
    blogId: blog.id,
  };

  postsRepository.update(updatedPost);
  res.sendStatus(HttpStatus.No_Content);
};

const deletePost = (req: RequestWithParams<PostIdParamType>, res: Response) => {
  const wasDeleted = postsRepository.remove(req.params.id);
  res.sendStatus(wasDeleted ? HttpStatus.No_Content : HttpStatus.Not_Found);
};

const postsController = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};

export { postsController };
