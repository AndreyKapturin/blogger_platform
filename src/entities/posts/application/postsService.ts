import { inject, injectable } from 'inversify';
import { Result, ResultStatus } from '../../../core/utils/Result';
import { ResultFactory } from '../../../core/utils/Result/ResultFactory';
import { BlogsCommandRepository } from '../../blogs/repositories/blogsCommandRepository';
import { PostsCommandRepository } from '../repositories/postsCommandRepository';
import { PostDocumentType, PostModel } from '../domain/PostModel';
import { InputCreatePostDto } from '../domain/InputCreatePostDto';
import { InputUpdatePostDto } from '../domain/InputUpdatePostDto';
import { InputPostLikeStatusDto } from '../domain/InputPostLikeStatusDto';
import { UsersCommandRepository } from '../../users/repositories/usersCommandRepository';
import { ReactionRepository } from '../../reactions/repositories/ReactionRepository';
import { LikeStatus } from '../../comments/types';
import { ReactionDocument, ReactionModel } from '../../reactions/domain/ReactionModel';
import { NewestLike } from '../types';

@injectable()
class PostsService {
  constructor(
    @inject(BlogsCommandRepository)
    private blogsCommandRepository: BlogsCommandRepository,
    @inject(PostsCommandRepository)
    private postsCommandRepository: PostsCommandRepository,
    @inject(UsersCommandRepository)
    private usersCommandRepository: UsersCommandRepository,
    @inject(ReactionRepository)
    private reactionRepository: ReactionRepository,
  ) {}
  async createPost(inputCreatePostDto: InputCreatePostDto): Promise<Result<string>> {
    const blogDocument = await this.blogsCommandRepository.findById(inputCreatePostDto.blogId);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputCreatePostDto.blogId} not found`,
        },
      ]);
    }

    const newPostDocument = new PostModel({
      title: inputCreatePostDto.title,
      content: inputCreatePostDto.content,
      shortDescription: inputCreatePostDto.shortDescription,
      blogName: blogDocument.name,
      blogId: blogDocument.id,
      createdAt: new Date(),
    });

    const createdPostId = await this.postsCommandRepository.save(newPostDocument);

    return ResultFactory.success(createdPostId);
  }

  async updatePost(
    postId: string,
    inputUpdatePostDto: InputUpdatePostDto,
  ): Promise<Result<string | null>> {
    const blogDocument = await this.blogsCommandRepository.findById(inputUpdatePostDto.blogId);

    if (!blogDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Blog not found', [
        {
          field: 'blogId',
          message: `Blog with id ${inputUpdatePostDto.blogId} not found`,
        },
      ]);
    }

    const postDocument = await this.postsCommandRepository.findById(postId);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    postDocument.title = inputUpdatePostDto.title;
    postDocument.content = inputUpdatePostDto.content;
    postDocument.shortDescription = inputUpdatePostDto.shortDescription;
    postDocument.blogId = blogDocument.id;
    postDocument.blogName = blogDocument.name;

    await this.postsCommandRepository.update(postDocument);
    return ResultFactory.success(null);
  }

  async deletePost(id: string): Promise<Result> {
    const postDocument = await this.postsCommandRepository.findById(id);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${id} not exist`,
        },
      ]);
    }

    await this.postsCommandRepository.delete(postDocument);
    return ResultFactory.success(null);
  }

  async changeLikeStatus(inputPostLikeStatusDto: InputPostLikeStatusDto): Promise<Result> {
    const { postId, newLikeStatus, userId } = inputPostLikeStatusDto;

    const userDocument = await this.usersCommandRepository.findById(userId);

    if (!userDocument) {
      return ResultFactory.wrong(ResultStatus.InvalidCredentials, 'User unauthorized', [
        {
          field: 'accessToken',
          message: `User unauthorized`,
        },
      ]);
    }

    const postDocument = await this.postsCommandRepository.findById(postId);

    if (!postDocument) {
      return ResultFactory.wrong(ResultStatus.NotFound, 'Post not found', [
        {
          field: 'id',
          message: `Post with id ${postId} not found`,
        },
      ]);
    }

    const oldReaction = await this.reactionRepository.findByParentIdAndUserId(postId, userId);

    if (oldReaction && oldReaction.status === newLikeStatus) return ResultFactory.success(null);
    if (!oldReaction && newLikeStatus === LikeStatus.None) return ResultFactory.success(null);

    if (oldReaction) {
      await this._updateOldReaction(postDocument, oldReaction, newLikeStatus);
    } else {
      const newReaction = new ReactionModel({
        login: userDocument.login,
        userId: userId,
        parentId: postId,
        status: newLikeStatus,
      });
      await this._addNewReaction(postDocument, newReaction);
    }

    return ResultFactory.success(null);
  }

  private async _updateOldReaction(
    postDocument: PostDocumentType,
    oldReaction: ReactionDocument,
    newLikeStatus: LikeStatus,
  ) {
    switch (oldReaction.status) {
      case LikeStatus.Like:
        if (newLikeStatus === LikeStatus.Dislike) postDocument.likeToDislike();
        if (newLikeStatus === LikeStatus.None) postDocument.removeLike();
        break;

      case LikeStatus.Dislike:
        if (newLikeStatus === LikeStatus.Like) postDocument.dislikeToLike();
        if (newLikeStatus === LikeStatus.None) postDocument.removeDislike();
        break;

      case LikeStatus.None:
        if (newLikeStatus === LikeStatus.Like) postDocument.addLike();
        if (newLikeStatus === LikeStatus.None) postDocument.addDislike();
        break;
      default:
        break;
    }

    oldReaction.updateStatus(newLikeStatus);
    await this.reactionRepository.update(oldReaction);
    await this._updateNewestLikes(postDocument);
    await this.postsCommandRepository.update(postDocument);
  }

  private async _addNewReaction(
    postDocument: PostDocumentType,
    newReaction: ReactionDocument,
  ): Promise<void> {
    if (newReaction.status === LikeStatus.Like) postDocument.addLike();
    if (newReaction.status === LikeStatus.Dislike) postDocument.addDislike();

    await this.reactionRepository.save(newReaction);
    await this._updateNewestLikes(postDocument);
    await this.postsCommandRepository.update(postDocument);
  }

  private async _updateNewestLikes(postDocument: PostDocumentType): Promise<void> {
    const lastLikeDocuments = await this.reactionRepository.getLastLikes(
      postDocument._id.toString(),
    );

    const newestLikes: NewestLike[] = lastLikeDocuments.map((lld) => {
      return {
        login: lld.login,
        userId: lld.userId,
        addedAt: lld.addedAt.toISOString(),
      };
    });

    postDocument.setNewestLikes(newestLikes);
  }
}

export { PostsService };
