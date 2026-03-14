import { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
} from '../../../core/types/RequestTypes';
import { BlogIdParamType, InputBlogType, ViewBlogQuery, ViewBlogType } from '../types';
import { APIErrorResult } from '../../../core/types/APIErrorResult';
import { BlogsService } from '../application/blogsService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { BlogsQueryRepository } from '../repositories/blogsQueryRepository';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { InputBlogPostType, InputPostType, ViewPostQuery, ViewPostType } from '../../posts/types';
import { PostsService } from '../../posts/application/postsService';
import { PostsQueryRepository } from '../../posts/repositories/postsQueryRepository';
import { Paginator } from '../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { inject, injectable } from 'inversify';

@injectable()
class BlogsController {
  constructor(
    @inject(BlogsService)
    private blogsService: BlogsService,
    @inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
    @inject(PostsService)
    private postsService: PostsService,
    @inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async createBlog(
    req: RequestWithBody<InputBlogType>,
    res: Response<ViewBlogType | APIErrorResult>,
  ) {
    const createBlogResult = await this.blogsService.createBlog(req.body);

    if (isWrongResult(createBlogResult)) {
      sendHttpResponseIfWrongResult(createBlogResult, res);
      return;
    }

    const blog = await this.blogsQueryRepository.findById(createBlogResult.data);
    res.status(HttpStatus.Created).json(blog!);
  }

  async createPostForBlog(
    req: RequestWithParamsAndBody<BlogIdParamType, InputBlogPostType>,
    res: Response<ViewPostType | APIErrorResult>,
  ) {
    const inputPost: InputPostType = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: req.params.id,
    };

    const createdPostResult = await this.postsService.createPost(inputPost);

    if (isWrongResult(createdPostResult)) {
      sendHttpResponseIfWrongResult(createdPostResult, res);
      return;
    }

    const createdPost = await this.postsQueryRepository.findById(createdPostResult.data);
    res.status(HttpStatus.Created).json(createdPost!);
  }

  async deleteBlog(req: RequestWithParams<BlogIdParamType>, res: Response) {
    const deleteBlogResult = await this.blogsService.deleteBlog(req.params.id);

    if (isWrongResult(deleteBlogResult)) {
      sendHttpResponseIfWrongResult(deleteBlogResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async getBlogById(req: RequestWithParams<BlogIdParamType>, res: Response<ViewBlogType>) {
    const foundBlog = await this.blogsQueryRepository.findById(req.params.id);
    if (!foundBlog) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }
    res.status(HttpStatus.Ok).json(foundBlog);
  }

  async getBlogs(req: RequestWithQuery<ViewBlogQuery>, res: Response<Paginator<ViewBlogType>>) {
    const cleanQuery = matchedData<ViewBlogQuery>(req, { locations: ['query'] });
    const paginatedViewBlogs = await this.blogsQueryRepository.findAllWithPagination(cleanQuery);
    res.status(HttpStatus.Ok).json(paginatedViewBlogs);
  }

  async getPostsOfBlog(
    req: RequestWithParamsAndQuery<BlogIdParamType, ViewPostQuery>,
    res: Response<Paginator<ViewPostType>>,
  ) {
    const blogId = req.params.id;
    const blog = await this.blogsQueryRepository.findById(blogId);

    if (!blog) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }

    const cleanQuery = matchedData<ViewPostQuery>(req, { locations: ['query'] });
    const paginatedViewPosts = await this.postsQueryRepository.findAllForBlogWithPagination(
      blogId,
      cleanQuery,
    );
    res.status(HttpStatus.Ok).json(paginatedViewPosts);
  }

  async updateBlog(req: RequestWithParamsAndBody<BlogIdParamType, InputBlogType>, res: Response) {
    const updateBlogResult = await this.blogsService.updateBlog(req.params.id, req.body);

    if (isWrongResult(updateBlogResult)) {
      sendHttpResponseIfWrongResult(updateBlogResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { BlogsController };
