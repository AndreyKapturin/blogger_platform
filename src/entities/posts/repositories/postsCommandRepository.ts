import { injectable } from 'inversify';
import { PostDocumentType, PostModel } from '../domain/PostModel';

@injectable()
class PostsCommandRepository {
  async findById(id: string): Promise<PostDocumentType | null> {
    return await PostModel.findById(id);
  }

  async checkById(id: string): Promise<boolean> {
    const foundPostDocument = await PostModel.exists({ _id: id });
    return Boolean(foundPostDocument);
  }

  async save(newPostDocument: PostDocumentType): Promise<string> {
    const savedPostDocument = await newPostDocument.save();
    return savedPostDocument.id;
  }

  async update(updatedPostDocument: PostDocumentType): Promise<boolean> {
    await updatedPostDocument.save();
    return true;
  }

  async delete(postDocument: PostDocumentType): Promise<boolean> {
    const deleteResult = await postDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }

  async removeRelated(blogId: string) {
    const deleteResult = await PostModel.deleteMany({ blogId });
    return deleteResult.deletedCount !== 0;
  }

  async updateRelated(blogId: string, blogName: string) {
    const updateREsult = await PostModel.updateMany({ blogId }, { $set: { blogName } });
    return updateREsult.matchedCount !== 0;
  }

  async cleanAll(): Promise<void> {
    await PostModel.deleteMany();
  }
}

export { PostsCommandRepository };
