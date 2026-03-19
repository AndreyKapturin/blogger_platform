import mongoose from 'mongoose';
import { CommentatorInfoType, CommentType } from '../types';
import {
  MIN_COMMENT_CONTENT_LENGTH_DB,
  MAX_COMMENT_CONTENT_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type CommentDocumentType = mongoose.HydratedDocument<CommentType>;
type CommentLeanDocument = LeanDocument<CommentType>;

const commentatorInfoSchema = new mongoose.Schema<CommentatorInfoType>(
  {
    userId: { type: 'String', required: true },
    userLogin: { type: 'String', required: true },
  },
  {
    _id: false,
  },
);

const commentSchema = new mongoose.Schema<CommentType>({
  postId: { type: 'String', required: true },
  content: {
    type: 'String',
    required: true,
    minLength: MIN_COMMENT_CONTENT_LENGTH_DB,
    maxLength: MAX_COMMENT_CONTENT_LENGTH_DB,
  },
  commentatorInfo: commentatorInfoSchema,
  createdAt: { type: 'Date', required: true, default: new Date() },
});

const CommentModel = mongoose.model<CommentType>('Comment', commentSchema);

export { CommentModel };
export type { CommentDocumentType, CommentLeanDocument };
