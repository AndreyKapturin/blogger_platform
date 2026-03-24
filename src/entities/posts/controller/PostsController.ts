import { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
} from '../../../core/types/RequestTypes';
import {
  CommentIdParamType,
  InputCommentType,
  ViewCommentsQuery,
  ViewCommentType,
} from '../../comments/types';
import { APIErrorResult } from '../../../core/types/APIErrorResult';
import { CommentsService } from '../../comments/application/commentsService';
import {
  isWrongResult,
  sendHttpResponseIfWrongResult,
} from '../../../core/utils/Result/sendHttpResponseIfWrongResult';
import { CommentsQueryRepository } from '../../comments/repositories/commentsQueryRepository';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { InputPostType, PostIdParamType, ViewPostQuery, ViewPostType } from '../types';
import { PostsService } from '../application/postsService';
import { PostsQueryRepository } from '../repositories/postsQueryRepository';
import { Paginator } from '../../../core/types/PaginationAndSorting';
import { matchedData } from 'express-validator';
import { PostsCommandRepository } from '../repositories/postsCommandRepository';
import { inject, injectable } from 'inversify';
import { InputCreatePostDto } from '../domain/InputCreatePostDto';
import { InputUpdatePostDto } from '../domain/InputUpdatePostDto';

@injectable()
class PostsController {
  constructor(
    @inject(PostsService)
    private postsService: PostsService,
    @inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
    @inject(CommentsService)
    private commentsService: CommentsService,
    @inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async createPostComment(
    req: RequestWithParamsAndBody<CommentIdParamType, InputCommentType>,
    res: Response<ViewCommentType | APIErrorResult>,
  ) {
    const createCommentResult = await this.commentsService.createComment(
      req.params.id,
      req.user!.userId,
      req.body.content,
    );

    if (isWrongResult(createCommentResult)) {
      sendHttpResponseIfWrongResult(createCommentResult, res);
      return;
    }

    const createdComment = await this.commentsQueryRepository.findById(createCommentResult.data);
    res.status(HttpStatus.Created).json(createdComment!);
  }

  async createPost(
    req: RequestWithBody<InputPostType>,
    res: Response<ViewPostType | APIErrorResult>,
  ) {
    const inputCreatePostDto = new InputCreatePostDto(
      req.body.title,
      req.body.content,
      req.body.shortDescription,
      req.body.blogId,
    );

    const createdPostResult = await this.postsService.createPost(inputCreatePostDto);

    if (isWrongResult(createdPostResult)) {
      sendHttpResponseIfWrongResult(createdPostResult, res);
      return;
    }

    const createdPost = await this.postsQueryRepository.findById(createdPostResult.data);
    res.status(HttpStatus.Created).json(createdPost!);
  }

  async deletePost(req: RequestWithParams<PostIdParamType>, res: Response) {
    const deletePostResult = await this.postsService.deletePost(req.params.id);

    if (isWrongResult(deletePostResult)) {
      sendHttpResponseIfWrongResult(deletePostResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }

  async getPostById(req: RequestWithParams<PostIdParamType>, res: Response<ViewPostType>) {
    const foundPost = await this.postsQueryRepository.findById(req.params.id);

    if (!foundPost) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }

    res.status(HttpStatus.Ok).json(foundPost);
  }

  async getPostComments(
    req: RequestWithParamsAndQuery<PostIdParamType, ViewCommentsQuery>,
    res: Response<Paginator<ViewCommentType>>,
  ) {
    const postId = req.params.id;
    const cleanQuery = matchedData(req, { locations: ['query'] }) as ViewCommentsQuery;

    const postExist = await this.postsCommandRepository.checkById(postId);

    if (!postExist) {
      res.sendStatus(HttpStatus.Not_Found);
      return;
    }

    const paginatedViewComments = await this.commentsQueryRepository.findAllForPostWithPagination(
      postId,
      cleanQuery,
      req.user?.userId,
    );

    res.status(HttpStatus.Ok).json(paginatedViewComments);
  }

  async getPosts(req: RequestWithQuery<ViewPostQuery>, res: Response<Paginator<ViewPostType>>) {
    const cleanQuery = matchedData<ViewPostQuery>(req, { locations: ['query'] });
    const paginateViewPosts = await this.postsQueryRepository.findAllWithPagination(cleanQuery);
    res.status(HttpStatus.Ok).json(paginateViewPosts);
  }

  async updatePost(
    req: RequestWithParamsAndBody<PostIdParamType, InputPostType>,
    res: Response<APIErrorResult>,
  ) {
    const inputUpdatePostDto = new InputUpdatePostDto(
      req.body.title,
      req.body.content,
      req.body.shortDescription,
      req.body.blogId,
    );

    const updatePostResult = await this.postsService.updatePost(req.params.id, inputUpdatePostDto);

    if (isWrongResult(updatePostResult)) {
      sendHttpResponseIfWrongResult(updatePostResult, res);
      return;
    }

    res.sendStatus(HttpStatus.No_Content);
  }
}

export { PostsController };
