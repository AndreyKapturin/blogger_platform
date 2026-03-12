import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../../database/mongoDB';
import { CommentType, MongoCommentType } from '../types';

class CommentsCommandRepository {
  async findById(commentId: string) {
    const foundComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    return foundComment ? this._cleanObjectIdMapper(foundComment) : null;
  }

  async save(inputComment: MongoCommentType) {
    const { insertedId } = await commentsCollection.insertOne(inputComment);
    return insertedId.toString();
  }

  async update(commentId: string, content: string) {
    const updateResult = await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content } },
    );

    return updateResult.matchedCount === 1;
  }

  async remove(commentId: string) {
    const deleteResult = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    return deleteResult.deletedCount === 1;
  }

  async cleanAll() {
    await commentsCollection.deleteMany();
  }

  private _cleanObjectIdMapper(mongoComment: WithId<MongoCommentType>): CommentType {
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
  }
}

export { CommentsCommandRepository };
