import { Filter, ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../database/mongoDB';
import { CommentType, MongoCommentType, ViewCommentsQuery, ViewCommentType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';

class CommentsQueryRepository {
   async findById(commentId: string) {
    const foundComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    return foundComment ? this._commentToViewMapper(foundComment) : null;
  }

   async findAllForPostWithPagination(postId: string, commentsQuery: ViewCommentsQuery) {
    const { sortBy, sortDirection, pageSize, pageNumber } = commentsQuery;

    const skip = (pageNumber - 1) * pageSize;
    const filter: Filter<MongoCommentType> = { postId };
    const foundComments = await commentsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .map(this._commentToViewMapper)
      .toArray();

    const totalCount = await commentsCollection.countDocuments(filter);
    const paginatedViewComments = toPaginateMapper(foundComments, commentsQuery, totalCount);
    return paginatedViewComments;
  }

  private _commentToViewMapper(mongoComment: WithId<MongoCommentType>): ViewCommentType {
    return {
      id: mongoComment._id.toString(),
      content: mongoComment.content,
      commentatorInfo: mongoComment.commentatorInfo,
      createdAt: mongoComment.createdAt,
    };
  }
}

const commentsQueryRepository = new CommentsQueryRepository();

export { commentsQueryRepository };
