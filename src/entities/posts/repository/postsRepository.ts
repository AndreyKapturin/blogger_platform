import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../../database/mongoDB';
import { InputPostType, PostType } from '../types';

const fildAll = async () => postsCollection.find().toArray();
const findById = async (postId: string) => postsCollection.findOne({ _id: new ObjectId(postId) });
const save = async (inputPost: PostType): Promise<WithId<PostType>> => {
  const { insertedId } = await postsCollection.insertOne(inputPost);
  return { ...inputPost, _id: insertedId };
};
const update = async (postId: string, inputPost: InputPostType) => {
  const updateResult = await postsCollection.updateOne(
    { _id: new ObjectId(postId) },
    {
      $set: {
        title: inputPost.title,
        content: inputPost.content,
        shortDescription: inputPost.shortDescription,
        blogId: inputPost.blogId,
      },
    }
  );
  return updateResult.modifiedCount !== 0;
};
const remove = async (postId: string) => {
  const deleteREsult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
  return deleteREsult.deletedCount !== 0;
};
const removeRelated = async (blogId: string) => {
  const deleteREsult = await postsCollection.deleteMany({ blogId: blogId });
  return deleteREsult.deletedCount !== 0;
};

const cleanAll = async () => {
  await postsCollection.deleteMany();
};

const postsRepository = {
  fildAll,
  findById,
  save,
  update,
  remove,
  removeRelated,
  cleanAll,
};

export { postsRepository };
