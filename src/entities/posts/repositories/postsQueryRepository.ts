import { Filter, ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../../database/mongoDB';
import { PostType, ViewPostQuery, ViewPostType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';

class PostsQueryRepository {
  static async findAllWithPagination(postsQuery: ViewPostQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const foundPosts = await postsCollection
      .find()
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .map(PostsQueryRepository._postToViewMapper)
      .toArray();

    const totalCount = await postsCollection.countDocuments();
    const paginatedViewPosts = toPaginateMapper(foundPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  static async findAllForBlogWithPagination(blogId: string, postsQuery: ViewPostQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: Filter<PostType> = { blogId };
    const foundPosts = await postsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .map(PostsQueryRepository._postToViewMapper)
      .toArray();

    const totalCount = await postsCollection.countDocuments(filter);
    const paginatedViewPosts = toPaginateMapper(foundPosts, postsQuery, totalCount);
    return paginatedViewPosts;
  }

  static async findById(postId: string) {
    const foundPost = await postsCollection.findOne({ _id: new ObjectId(postId) });
    return foundPost ? PostsQueryRepository._postToViewMapper(foundPost) : null;
  }

  static _postToViewMapper(mongoPost: WithId<PostType>): ViewPostType {
    return {
      id: mongoPost._id.toString(),
      title: mongoPost.title,
      content: mongoPost.content,
      shortDescription: mongoPost.shortDescription,
      createdAt: mongoPost.createdAt,
      blogId: mongoPost.blogId,
      blogName: mongoPost.blogName,
    };
  }
}
const postsQueryRepository = PostsQueryRepository;

export { postsQueryRepository };
