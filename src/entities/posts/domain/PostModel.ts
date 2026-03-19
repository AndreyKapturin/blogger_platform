import mongoose from 'mongoose';
import { PostType } from '../types';
import {
  MAX_BLOG_NAME_LENGTH_DB,
  MAX_POST_CONTENT_LENGTH_DB,
  MAX_POST_SHORT_DESCRIPTION_LENGTH_DB,
  MAX_POST_TITLE_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type PostDocumentType = mongoose.HydratedDocument<PostType>;
type PostLeanDocument = LeanDocument<PostType>;

const postSchema = new mongoose.Schema<PostType>({
  title: { type: 'String', required: true, maxLength: MAX_POST_TITLE_LENGTH_DB },
  shortDescription: {
    type: 'String',
    required: true,
    maxLength: MAX_POST_SHORT_DESCRIPTION_LENGTH_DB,
  },
  content: { type: 'String', required: true, maxLength: MAX_POST_CONTENT_LENGTH_DB },
  blogId: { type: 'String', required: true },
  blogName: { type: 'String', required: true, maxLength: MAX_BLOG_NAME_LENGTH_DB },
  createdAt: { type: 'Date', required: true, default: new Date() },
});

const PostModel = mongoose.model<PostType>('Post', postSchema);

export { PostModel };
export type { PostDocumentType, PostLeanDocument };
