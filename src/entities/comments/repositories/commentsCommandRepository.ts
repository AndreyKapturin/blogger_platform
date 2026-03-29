import { injectable } from 'inversify';
import { CommentDocumentType, CommentModel } from '../domain/CommentModel';

@injectable()
class CommentsCommandRepository {
  async findById(id: string): Promise<CommentDocumentType | null> {
    return await CommentModel.findById(id);
  }

  async save(newCommentDocument: CommentDocumentType): Promise<string> {
    const savedCommentDocument = await newCommentDocument.save();
    return savedCommentDocument._id.toString();
  }

  async update(updatedCommentDocument: CommentDocumentType): Promise<boolean> {
    const updateResult = await updatedCommentDocument.save();
    return true;
  }

  async delete(commentDocument: CommentDocumentType): Promise<boolean> {
    const deleteResult = await commentDocument.deleteOne();
    return deleteResult.deletedCount === 1;
  }

  async cleanAll(): Promise<void> {
    await CommentModel.deleteMany();
  }
}

export { CommentsCommandRepository };
