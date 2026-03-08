import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { InputBlogType, BlogType, ViewBlogType } from '../types';

class BlogsCommandRepository {
  static async findById(blogId: string) {
    const foundBlog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    return foundBlog ? BlogsCommandRepository._blogToViewMapper(foundBlog) : null;
  }

  static async checkBlogById(blogId: string) {
    const docimentsCount = await blogsCollection.countDocuments(
      { _id: new ObjectId(blogId) },
      { limit: 1 },
    );
    return Boolean(docimentsCount);
  }

  static async save(inputBlog: BlogType): Promise<string> {
    const { insertedId } = await blogsCollection.insertOne(inputBlog);
    return insertedId.toString();
  }

  static async update(blogId: string, inputBlog: InputBlogType) {
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: inputBlog },
    );
    return result.matchedCount === 1;
  }

  static async remove(blogId: string) {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    return result.deletedCount === 1;
  }

  static async cleanAll() {
    await blogsCollection.deleteMany();
  }

  static _blogToViewMapper(mongoBlog: WithId<BlogType>): ViewBlogType {
    return {
      id: mongoBlog._id.toString(),
      name: mongoBlog.name,
      createdAt: mongoBlog.createdAt,
      isMembership: mongoBlog.isMembership,
      description: mongoBlog.description,
      websiteUrl: mongoBlog.websiteUrl,
    };
  }
}

const blogsCommandRepository = BlogsCommandRepository;

export { blogsCommandRepository };
