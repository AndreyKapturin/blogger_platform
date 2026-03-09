import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../../database/mongoDB';
import { InputBlogType, BlogType, ViewBlogType } from '../types';

class BlogsCommandRepository {
  async findById(blogId: string) {
    const foundBlog = await blogsCollection.findOne({ _id: new ObjectId(blogId) });
    return foundBlog ? this._blogToViewMapper(foundBlog) : null;
  }

  async checkBlogById(blogId: string) {
    const docimentsCount = await blogsCollection.countDocuments(
      { _id: new ObjectId(blogId) },
      { limit: 1 },
    );
    return Boolean(docimentsCount);
  }

  async save(inputBlog: BlogType): Promise<string> {
    const { insertedId } = await blogsCollection.insertOne(inputBlog);
    return insertedId.toString();
  }

  async update(blogId: string, inputBlog: InputBlogType) {
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: inputBlog },
    );
    return result.matchedCount === 1;
  }

  async remove(blogId: string) {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    return result.deletedCount === 1;
  }

  async cleanAll() {
    await blogsCollection.deleteMany();
  }

  private _blogToViewMapper(mongoBlog: WithId<BlogType>): ViewBlogType {
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

export { BlogsCommandRepository };
