import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../database/mongoDB';
import { CommentType, MongoCommentType, ViewCommentType } from '../types';

const findById = async (commentId: string) => {
  const foundComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
  return foundComment ? _commentToViewMapper(foundComment) : null;
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
};

export { commentsQueryRepository };
