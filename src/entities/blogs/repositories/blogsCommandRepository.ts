import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { InputBlogType, BlogType, ViewBlogType } from '../types';

const findById = async (blogId: string) => {
  const foundBlog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
  return foundBlog ? _blogToViewMapper(foundBlog) : null;
};

const checkBlogById = async (blogId: string) => {
  const docimentsCount = await blogsCollection.countDocuments({ _id: new ObjectId(blogId) }, { limit: 1 });
  return Boolean(docimentsCount);
};

const save = async (inputBlog: BlogType): Promise<string> => {
  const { insertedId } = await blogsCollection.insertOne(inputBlog);
  return insertedId.toString();
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

const _blogToViewMapper = (mongoBlog: WithId<BlogType>): ViewBlogType => {
  return {
    id: mongoBlog._id.toString(),
    name: mongoBlog.name,
    createdAt: mongoBlog.createdAt,
    isMembership: mongoBlog.isMembership,
    description: mongoBlog.description,
    websiteUrl: mongoBlog.websiteUrl,
  };
};

const blogsCommandRepository = {
  findById,
  checkBlogById,
  save,
  update,
  remove,
  cleanAll,
};
export { blogsCommandRepository };
