import { Request, Response } from 'express';
import { ViewPostType } from '../../types';
import { postsRepository } from '../../repository/postsRepository';
import { HttpStatus } from '../../../../core/types/HttpStatus';
import { blogsRepository } from '../../../blogs/repository/blogsRepository';
import { postToViewMapper } from '../utils/postToViewMapper';

const getPosts = async (req: Request, res: Response<ViewPostType[]>) => {
  const posts = await postsRepository.findAll();
  const postsWithBlogName: ViewPostType[] = await Promise.all(
    posts.map(async (post) => {
      const blog = await blogsRepository.findById(post.blogId);
      const blogName = blog ? blog.name : 'Blog does not exist';
      return postToViewMapper(post, blogName);
    })
  );
  res.status(HttpStatus.Ok).json(postsWithBlogName);
};

export { getPosts };
