import { injectable } from 'inversify';
import { ReactionDocument, ReactionModel } from '../domain/ReactionModel';
import { LikeStatus } from '../../comments/types';

@injectable()
class ReactionRepository {
  async findByParentIdAndUserId(
    parentId: string,
    userId: string,
  ): Promise<ReactionDocument | null> {
    return ReactionModel.findOne({ parentId, userId });
  }

  async getLastLikes(parentId: string): Promise<ReactionDocument[]> {
    return ReactionModel.find({ parentId, status: LikeStatus.Like })
      .sort({ addedAt: 'desc' })
      .limit(3);
  }

  async save(reactionDocument: ReactionDocument): Promise<string> {
    const savedReactionDocument = await reactionDocument.save();
    return savedReactionDocument._id.toString();
  }

  async update(reactionDocument: ReactionDocument): Promise<boolean> {
    await reactionDocument.save();
    return true;
  }
}

export { ReactionRepository };
