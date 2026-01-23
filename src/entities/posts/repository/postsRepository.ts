import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../../database/mongoDB';
import { InputPostType, PostType, ViewPostQuery } from '../types';

const findAll = async (postsQuery: ViewPostQuery) => {
  const { sortBy, sortDirection, pageSize, pageNumber } = postsQuery;
  const skip = (pageNumber - 1) * pageSize;
  const items = await postsCollection
    .find()
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const totalCount = await postsCollection.countDocuments();
  return { items, totalCount };
};

const findById = async (postId: string) => {
  return await postsCollection.findOne({ _id: new ObjectId(postId) });
};

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
        blogName: inputPost.blogName,
      },
    },
  );
  return updateResult.matchedCount === 1;
};

const remove = async (postId: string) => {
  const deleteREsult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });
  return deleteREsult.deletedCount === 1;
};

const removeRelated = async (blogId: string) => {
  const deleteREsult = await postsCollection.deleteMany({ blogId: blogId });
  return deleteREsult.deletedCount !== 0;
};

const updateRelated = async (blogId: string, blogName: string) => {
  const updateREsult = await postsCollection.updateMany({ blogId: blogId }, { $set: { blogName } });
  return updateREsult.matchedCount !== 0;
};

const cleanAll = async () => {
  await postsCollection.deleteMany();
};

const postsRepository = {
  findAll,
  findById,
  save,
  update,
  remove,
  removeRelated,
  updateRelated,
  cleanAll,
};

export { postsRepository };
