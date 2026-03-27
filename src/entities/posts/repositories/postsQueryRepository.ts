import { PostType, ViewPostQuery, ViewPostType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { PostLeanDocument, PostModel } from '../domain/PostModel';
import { QueryFilter } from 'mongoose';
import { LikeStatus } from '../../comments/types';

@injectable()
class PostsQueryRepository {
  async findAllWithPagination(postsQuery: ViewPostQuery, userId?: string) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const foundPosts: PostLeanDocument[] = await PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewPosts: ViewPostType[] = foundPosts.map((pld) => this._postToViewMapper(pld, userId));

    const totalCount = await PostModel.countDocuments();
    const paginatedViewPosts = toPaginateMapper(viewPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  async findAllForBlogWithPagination(blogId: string, postsQuery: ViewPostQuery, userId?: string) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: QueryFilter<PostType> = { blogId };

    const foundPosts = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewPosts: ViewPostType[] = foundPosts.map((pld) => this._postToViewMapper(pld, userId));
    const totalCount = await PostModel.countDocuments(filter);

    const paginatedViewPosts = toPaginateMapper(viewPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  async findById(postId: string, userId?: string): Promise<ViewPostType | null> {
    
    const postLeanDocument = await PostModel.findById(postId).lean();
    return postLeanDocument ? this._postToViewMapper(postLeanDocument, userId) : null;
  }

  private _postToViewMapper(postLeanDocument: PostLeanDocument, userId?: string): ViewPostType {
    const reactionStats = postLeanDocument.reactions.reduce(
      (rs, r) => {
        if (r.status === LikeStatus.Like) rs.likesCount += 1;
        if (r.status === LikeStatus.Dislike) rs.dislikesCount += 1;
        if (userId && r.userId === userId) rs.myStatus = r.status;
        return rs;
      },
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    );
    
    const newestLikes = postLeanDocument.reactions
      .filter((r) => r.status === LikeStatus.Like)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, 3)
      .map((r) => {
        return {
          addedAt: r.addedAt.toISOString(),
          userId: r.userId,
          login: r.login,
        };
      });

    return {
      id: postLeanDocument._id.toString(),
      title: postLeanDocument.title,
      content: postLeanDocument.content,
      shortDescription: postLeanDocument.shortDescription,
      createdAt: postLeanDocument.createdAt.toISOString(),
      blogId: postLeanDocument.blogId,
      blogName: postLeanDocument.blogName,
      extendedLikesInfo: {
        likesCount: reactionStats.likesCount,
        dislikesCount: reactionStats.dislikesCount,
        myStatus: reactionStats.myStatus,
        newestLikes,
      },
    };
  }
}

export { PostsQueryRepository };
