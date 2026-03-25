import { injectable } from 'inversify';
import { BlogDocumentType, BlogModel } from '../domain/BlogModel';

@injectable()
class BlogsCommandRepository {
  async findById(id: string): Promise<BlogDocumentType | null> {
    return await BlogModel.findById(id);
  }

  async save(newBlogDocument: BlogDocumentType): Promise<string> {
    const savedBlogDocument = await newBlogDocument.save();
    return savedBlogDocument.id;
  }

  async update(updatedBlogDocument: BlogDocumentType): Promise<boolean> {
    await updatedBlogDocument.save();
    return true;
  }
  
  async delete(blogDocument: BlogDocumentType): Promise<boolean> {
    const result = await blogDocument.deleteOne();
    return result.deletedCount === 1;
  }

  async cleanAll(): Promise<void> {
    await BlogModel.deleteMany();
  }
}

export { BlogsCommandRepository };
