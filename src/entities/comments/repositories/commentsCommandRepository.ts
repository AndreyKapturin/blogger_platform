import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../database/mongoDB';
import { CommentType, MongoCommentType } from '../types';

const findById = async (commentId: string) => {
  const foundComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
  return foundComment ? _cleanObjectIdMapper(foundComment) : null;
};

const save = async (inputComment: MongoCommentType) => {
  const { insertedId } = await commentsCollection.insertOne(inputComment);
  return insertedId.toString();
};

const update = async (commentId: string, content: string) => {
  const updateResult = await commentsCollection.updateOne(
    { _id: new ObjectId(commentId) },
    { $set: { content } },
  );

  return updateResult.matchedCount === 1;
};

const remove = async (commentId: string) => {
  const deleteResult = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
  return deleteResult.deletedCount === 1;
};

const cleanAll = async () => {
  await commentsCollection.deleteMany();
};

const _cleanObjectIdMapper = (mongoComment: WithId<MongoCommentType>): CommentType => {
  return {
    id: mongoComment._id.toString(),
    content: mongoComment.content,
    commentatorInfo: {
      userId: mongoComment.commentatorInfo.userId,
      userLogin: mongoComment.commentatorInfo.userLogin,
    },
    createdAt: mongoComment.createdAt,
    postId: mongoComment.postId,
  };
};

const commentsCommandRepository = {
  save,
  findById,
  update,
  remove,
  cleanAll,
};

export { commentsCommandRepository };
