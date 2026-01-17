import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { InputBlogType, BlogType } from '../types';

const findAll = async () => await blogsCollection.find({}).toArray();
const findById = async (blogId: string) => blogsCollection.findOne({ _id: new ObjectId(blogId) });
const save = async (inputBlog: BlogType): Promise<WithId<BlogType>> => {
  const { insertedId } = await blogsCollection.insertOne(inputBlog);
  return { ...inputBlog, _id: insertedId };
};
const update = async (blogId: string, inputBlog: InputBlogType) => {
  const result = await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $set: inputBlog }
  );

  return result.modifiedCount !== 0;
};

const remove = async (blogId: string) => {
  const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
  return result.deletedCount !== 0;
};

const cleanAll = async () => {
  await blogsCollection.deleteMany();
};

const blogsRepository = {
  findAll,
  findById,
  save,
  update,
  remove,
  cleanAll,
};
export { blogsRepository };
