import mongoose from 'mongoose';
import { BlogType } from '../types';
import {
  MAX_BLOG_DESCRIPTION_LENGTH_DB,
  MAX_BLOG_NAME_LENGTH_DB,
  MAX_BLOG_WEBSITE_URL_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type BlogDocumentType = mongoose.HydratedDocument<BlogType>;
type BlogLeanDocument = LeanDocument<BlogType>;

const blogSchema = new mongoose.Schema<BlogType>({
  name: { type: 'String', required: true, maxLength: MAX_BLOG_NAME_LENGTH_DB },
  description: { type: 'String', required: true, maxLength: MAX_BLOG_DESCRIPTION_LENGTH_DB },
  isMembership: { type: 'Boolean', default: false },
  websiteUrl: { type: 'String', required: true, maxLength: MAX_BLOG_WEBSITE_URL_LENGTH_DB },
  createdAt: { type: 'Date', required: true, default: () => new Date() },
});

const BlogModel = mongoose.model<BlogType>('Blog', blogSchema);

export { BlogModel };
export type { BlogDocumentType, BlogLeanDocument };
