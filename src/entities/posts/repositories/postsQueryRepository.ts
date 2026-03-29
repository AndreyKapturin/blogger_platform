import { PostType, ViewPostQuery, ViewPostType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { PostLeanDocument, PostModel } from '../domain/PostModel';
import { QueryFilter } from 'mongoose';
import { LikeStatus } from '../../comments/types';
import { ReactionDocument, ReactionModel } from '../../reactions/domain/ReactionModel';

@injectable()
class PostsQueryRepository {
  async findAllWithPagination(postsQuery: ViewPostQuery, userId?: string) {
    return this._findAllWithPagination({}, postsQuery, userId);
  }

  async findAllForBlogWithPagination(blogId: string, postsQuery: ViewPostQuery, userId?: string) {
    return this._findAllWithPagination({ blogId }, postsQuery, userId);
  }

  async findById(postId: string, userId?: string): Promise<ViewPostType | null> {
    const postLeanDocument = await PostModel.findById(postId).lean();

    let myStatus = LikeStatus.None;

    if (userId) {
      const reactionDocument = await ReactionModel.findOne({ parentId: postId, userId });
      myStatus = reactionDocument ? reactionDocument.status : myStatus;
    }

    return postLeanDocument ? this._postToViewMapper(postLeanDocument, myStatus) : null;
  }

  private async _findAllWithPagination(
    filter: QueryFilter<PostType>,
    postsQuery: ViewPostQuery,
    userId?: string,
  ) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const postLeanDocuments: PostLeanDocument[] = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    let viewPosts: ViewPostType[];

    if (!userId) {
      viewPosts = postLeanDocuments.map((pld) => this._postToViewMapper(pld, LikeStatus.None));
    } else {
      const postIds = postLeanDocuments.map((pld) => pld._id.toString());
      const reactionDocuments = await ReactionModel.find({ userId, parentId: { $in: postIds } });
      viewPosts = this._manyPostToViewMapper(postLeanDocuments, reactionDocuments);
    }

    const totalCount = await PostModel.countDocuments(filter);
    const paginatedViewPosts = toPaginateMapper(viewPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  private _postToViewMapper(
    postLeanDocument: PostLeanDocument,
    myStatus: LikeStatus,
  ): ViewPostType {
    return {
      id: postLeanDocument._id.toString(),
      title: postLeanDocument.title,
      content: postLeanDocument.content,
      shortDescription: postLeanDocument.shortDescription,
      createdAt: postLeanDocument.createdAt.toISOString(),
      blogId: postLeanDocument.blogId,
      blogName: postLeanDocument.blogName,
      extendedLikesInfo: {
        likesCount: postLeanDocument.likesInfo.likesCount,
        dislikesCount: postLeanDocument.likesInfo.dislikesCount,
        myStatus: myStatus,
        newestLikes: postLeanDocument.likesInfo.newestLikes,
      },
    };
  }

  private _manyPostToViewMapper(
    postLeanDocuments: PostLeanDocument[],
    reactionDocuments: ReactionDocument[],
  ): ViewPostType[] {
    const postStatusesDictionary = reactionDocuments.reduce((rd, r) => {
      rd.set(r.parentId, r.status);
      return rd;
    }, new Map());
    return postLeanDocuments.map((pld) => {
      const userStatus = postStatusesDictionary.get(pld._id.toString());
      const myStatus = userStatus ? userStatus : LikeStatus.None;
      return this._postToViewMapper(pld, myStatus);
    });
  }
}

export { PostsQueryRepository };
