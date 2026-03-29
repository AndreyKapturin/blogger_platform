import { HydratedDocument, model, Model, Schema } from 'mongoose';
import { LikeStatus } from '../../comments/types';
import { ReactionType } from '../types';

type ReactionMethods = {
  updateStatus(newStatus: LikeStatus): void;
};

type ReactionModelType = Model<ReactionType, {}, ReactionMethods>;

type ReactionDocument = HydratedDocument<ReactionType, ReactionMethods>;

const reactionShema = new Schema<ReactionType, ReactionModelType, ReactionMethods>(
  {
    login: { type: 'String', required: true },
    userId: { type: 'String', required: true },
    parentId: { type: 'String', required: true },
    status: { type: 'String', enum: LikeStatus },
    addedAt: { type: 'Date', required: true, default: () => new Date() },
  },
  {
    methods: {
      updateStatus(newStatus) {
        this.status = newStatus;
      },
    },
  },
);

const ReactionModel = model('Raction', reactionShema);

export { ReactionModel };
export type { ReactionDocument };
