import { HydratedDocument, Schema, model } from 'mongoose';
import { CommentatorInfoType, CommentType, LikesInfoType } from '../types';
import {
  MIN_COMMENT_CONTENT_LENGTH_DB,
  MAX_COMMENT_CONTENT_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type CommentDocumentType = HydratedDocument<CommentType>;
type CommentLeanDocument = LeanDocument<CommentType>;

const commentatorInfoSchema = new Schema<CommentatorInfoType>(
  {
    userId: { type: 'String', required: true },
    userLogin: { type: 'String', required: true },
  },
  {
    _id: false,
  },
);

const likesInfoSchema = new Schema<LikesInfoType>(
  {
    likesUserIds: { type: [{ type: 'String' }], default: [] },
    dislikesUserIds: { type: [{ type: 'String' }], default: [] },
  },
  {
    _id: false,
  },
);

const commentSchema: Schema<CommentType> = new Schema<CommentType>({
  postId: { type: 'String', required: true },
  content: {
    type: 'String',
    required: true,
    minLength: MIN_COMMENT_CONTENT_LENGTH_DB,
    maxLength: MAX_COMMENT_CONTENT_LENGTH_DB,
  },
  commentatorInfo: commentatorInfoSchema,
  likesInfo: { type: likesInfoSchema, default: { likesUserIds: [], dislikesUserIds: [] } },
  createdAt: { type: 'Date', required: true, default: () => new Date() },
});

const CommentModel = model('Comment', commentSchema);

export { CommentModel };
export type { CommentDocumentType, CommentLeanDocument };
