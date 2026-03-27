import { HydratedDocument, Model, Schema, model } from 'mongoose';
import { PostType, ReactionType } from '../types';
import {
  MAX_BLOG_NAME_LENGTH_DB,
  MAX_POST_CONTENT_LENGTH_DB,
  MAX_POST_SHORT_DESCRIPTION_LENGTH_DB,
  MAX_POST_TITLE_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';
import { LikeStatus } from '../../comments/types';

type PostMethods = {
  changeLikeStatus(userId: string, login: string, newLikeStatus: LikeStatus): void;
};

type PostModelType = Model<PostType, {}, PostMethods>;

type PostDocumentType = HydratedDocument<PostType, PostMethods>;
type PostLeanDocument = LeanDocument<PostType>;

const reactionsSchema = new Schema<ReactionType>(
  {
    login: { type: 'String', required: true },
    userId: { type: 'String', required: true },
    addedAt: { type: 'Date', required: true },
    status: { type: 'String', enum: LikeStatus },
  },
  {
    _id: false,
  },
);

const postSchema = new Schema<PostType, PostModelType, PostMethods>(
  {
    title: { type: 'String', required: true, maxLength: MAX_POST_TITLE_LENGTH_DB },
    shortDescription: {
      type: 'String',
      required: true,
      maxLength: MAX_POST_SHORT_DESCRIPTION_LENGTH_DB,
    },
    content: { type: 'String', required: true, maxLength: MAX_POST_CONTENT_LENGTH_DB },
    blogId: { type: 'String', required: true },
    blogName: { type: 'String', required: true, maxLength: MAX_BLOG_NAME_LENGTH_DB },
    createdAt: { type: 'Date', required: true, default: () => new Date() },
    reactions: { type: [{ type: reactionsSchema }], default: [] },
  },
  {
    methods: {
      changeLikeStatus(userId: string, login: string, newLikeStatus: LikeStatus): void {
        const userReaction = this.reactions.find((r) => r.userId === userId);

        if (!userReaction) {
          const newReaction: ReactionType = {
            userId,
            login,
            status: newLikeStatus,
            addedAt: new Date(),
          };

          this.reactions.push(newReaction);
          return;
        }

        userReaction.status = newLikeStatus;
      },
    },
  },
);

const PostModel = model<PostType, PostModelType>('Post', postSchema);

export { PostModel };
export type { PostDocumentType, PostLeanDocument };
