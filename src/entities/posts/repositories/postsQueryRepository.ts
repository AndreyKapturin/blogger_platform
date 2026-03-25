import { PostType, ViewPostQuery, ViewPostType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';
import { injectable } from 'inversify';
import { PostLeanDocument, PostModel } from '../domain/PostModel';
import { QueryFilter } from 'mongoose';

@injectable()
class PostsQueryRepository {
  async findAllWithPagination(postsQuery: ViewPostQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const foundPosts: PostLeanDocument[] = await PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewPosts: ViewPostType[] = foundPosts.map(this._postToViewMapper);

    const totalCount = await PostModel.countDocuments();
    const paginatedViewPosts = toPaginateMapper(viewPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  async findAllForBlogWithPagination(blogId: string, postsQuery: ViewPostQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: QueryFilter<PostType> = { blogId };

    const foundPosts = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const viewPosts: ViewPostType[] = foundPosts.map(this._postToViewMapper);
    const totalCount = await PostModel.countDocuments(filter);

    const paginatedViewPosts = toPaginateMapper(viewPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  async findById(id: string): Promise<ViewPostType | null> {
    const foundPostDocument = await PostModel.findById(id);
    return foundPostDocument ? this._postToViewMapper(foundPostDocument) : null;
  }

  private _postToViewMapper(postLeanDocument: PostLeanDocument): ViewPostType {
    return {
      id: postLeanDocument._id.toString(),
      title: postLeanDocument.title,
      content: postLeanDocument.content,
      shortDescription: postLeanDocument.shortDescription,
      createdAt: postLeanDocument.createdAt.toISOString(),
      blogId: postLeanDocument.blogId,
      blogName: postLeanDocument.blogName,
    };
  }
}

export { PostsQueryRepository };
