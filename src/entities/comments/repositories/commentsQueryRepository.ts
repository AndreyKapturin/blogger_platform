import { Filter, ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../database/mongoDB';
import { CommentType, MongoCommentType, ViewCommentsQuery, ViewCommentType } from '../types';
import { toPaginateMapper } from '../../../core/mappers/toPaginateMapper';

const findById = async (commentId: string) => {
  const foundComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
  return foundComment ? _commentToViewMapper(foundComment) : null;
};

const findAllForPostWithPagination = async (postId: string, commentsQuery: ViewCommentsQuery) => {
  const { sortBy, sortDirection, pageSize, pageNumber } = commentsQuery;

  const skip = (pageNumber - 1) * pageSize;
  const filter: Filter<MongoCommentType> = { postId };
  const foundComments = await commentsCollection
    .find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(pageSize)
    .map(_commentToViewMapper)
    .toArray();

  const totalCount = await commentsCollection.countDocuments(filter);
  const paginatedViewComments = toPaginateMapper(foundComments, commentsQuery, totalCount);
  return paginatedViewComments;
};

const _cleanObjectIdMapper = (mongoComment: WithId<MongoCommentType>): CommentType => {
  return {
    id: mongoComment._id.toString(),
    content: mongoComment.content,
    commentatorInfo: mongoComment.commentatorInfo,
    createdAt: mongoComment.createdAt,
    postId: mongoComment.postId,
  };
};

const _commentToViewMapper = (mongoComment: WithId<MongoCommentType>): ViewCommentType => {
  return {
    id: mongoComment._id.toString(),
    content: mongoComment.content,
    commentatorInfo: mongoComment.commentatorInfo,
    createdAt: mongoComment.createdAt,
  };
};

const commentsQueryRepository = {
  findById,
  findAllForPostWithPagination,
};

export { commentsQueryRepository };
