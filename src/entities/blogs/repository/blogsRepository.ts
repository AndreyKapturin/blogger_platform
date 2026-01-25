import { Filter, ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { InputBlogType, BlogType, ViewBlogQuery } from '../types';

const findAll = async (blogQuery: ViewBlogQuery) => {
  const filter: Filter<BlogType> = {};
  const { searchNameTerm, sortBy, sortDirection, pageSize, pageNumber } = blogQuery;

  const skip = (pageNumber - 1) * pageSize;

  if (searchNameTerm) {
    filter.name = { $regex: searchNameTerm, $options: 'i' };
  }

  const items = await blogsCollection
    .find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(pageSize)
    .toArray();

  const totalCount = await blogsCollection.countDocuments(filter);
  return { items, totalCount };
};

const findById = async (blogId: string) => {
  return await blogsCollection.findOne({ _id: new ObjectId(blogId) });
};

const save = async (inputBlog: BlogType): Promise<WithId<BlogType>> => {
  const { insertedId } = await blogsCollection.insertOne(inputBlog);
  return { ...inputBlog, _id: insertedId };
};

const update = async (blogId: string, inputBlog: InputBlogType) => {
  const result = await blogsCollection.updateOne(
    { _id: new ObjectId(blogId) },
    { $set: inputBlog },
  );
  return result.matchedCount === 1;
};

const remove = async (blogId: string) => {
  const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
  return result.deletedCount === 1;
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
