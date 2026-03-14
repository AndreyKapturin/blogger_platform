import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../../database/mongoDB';
import { InputUpdatePostType, PostType, ViewPostType } from '../types';
import { injectable } from 'inversify';

@injectable()
class PostsCommandRepository {
  async findById(postId: string) {
    const foundPost = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (!foundPost) return null;
    return this._cleanObjectIdMapper(foundPost);
  }

  async checkById(postId: string) {
    const documentsCount = await postsCollection.countDocuments(
      { _id: new ObjectId(postId) },
      { limit: 1 },
    );
    return Boolean(documentsCount);
  }

  async save(inputPost: PostType): Promise<string> {
    const { insertedId } = await postsCollection.insertOne(inputPost);
    return insertedId.toString();
  }

  async update(postId: string, inputPost: InputUpdatePostType) {
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          title: inputPost.title,
          content: inputPost.content,
          shortDescription: inputPost.shortDescription,
          blogId: inputPost.blogId,
          blogName: inputPost.blogName,
        },
      },
    );
    return updateResult.matchedCount === 1;
  }

  async remove(postId: string) {
    const deleteResult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
    return deleteResult.deletedCount === 1;
  }

  async removeRelated(blogId: string) {
    const deleteResult = await postsCollection.deleteMany({ blogId });
    return deleteResult.deletedCount !== 0;
  }

  async updateRelated(blogId: string, blogName: string) {
    const updateREsult = await postsCollection.updateMany({ blogId }, { $set: { blogName } });
    return updateREsult.matchedCount !== 0;
  }

  async cleanAll() {
    postsCollection.deleteMany();
  }

  private _cleanObjectIdMapper(mongoUser: WithId<PostType>): ViewPostType {
    return {
      id: mongoUser._id.toString(),
      title: mongoUser.title,
      content: mongoUser.content,
      shortDescription: mongoUser.shortDescription,
      blogName: mongoUser.blogName,
      blogId: mongoUser.blogId,
      createdAt: mongoUser.createdAt,
    };
  }
}

export { PostsCommandRepository };
