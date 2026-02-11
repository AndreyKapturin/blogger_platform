import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../../database/mongoDB';
import { InputUpdatePostType, PostType, ViewPostType } from '../types';

const findById = async (postId: string) => {
  const foundPost = await postsCollection.findOne({ _id: new ObjectId(postId) });
  if (!foundPost) return null;
  return _cleanObjectIdMapper(foundPost);
}

const save = async (inputPost: PostType): Promise<string> => {
  const { insertedId } = await postsCollection.insertOne(inputPost);
  return insertedId.toString();
};

const update = async (postId: string, inputPost: InputUpdatePostType) => {
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
};

const remove = async (postId: string) => {
  const deleteResult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
  return deleteResult.deletedCount === 1;
};

const removeRelated = async (blogId: string) => {
  const deleteResult = await postsCollection.deleteMany({ blogId });
  return deleteResult.deletedCount !== 0;
};

const updateRelated = async (blogId: string, blogName: string) => {
  const updateREsult = await postsCollection.updateMany({ blogId }, { $set: { blogName } });
  return updateREsult.matchedCount !== 0;
};

const cleanAll = async () => postsCollection.deleteMany();

const _cleanObjectIdMapper = (mongoUser: WithId<PostType>): ViewPostType => {
  return {
    id: mongoUser._id.toString(),
    title: mongoUser.title,
    content: mongoUser.content,
    shortDescription: mongoUser.shortDescription,
    blogName: mongoUser.blogName,
    blogId: mongoUser.blogId,
    createdAt: mongoUser.createdAt,
  }
}

const postsCommandRepository = {
  findById,
  save,
  update,
  remove,
  removeRelated,
  updateRelated,
  cleanAll,
};

export { postsCommandRepository };
