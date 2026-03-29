import { HydratedDocument, Model, Schema, Types, model, Document } from 'mongoose';
import { NewestLike, PostLikesInfoType, PostType } from '../types';
import {
  MAX_BLOG_NAME_LENGTH_DB,
  MAX_POST_CONTENT_LENGTH_DB,
  MAX_POST_SHORT_DESCRIPTION_LENGTH_DB,
  MAX_POST_TITLE_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type PostMethods = {
  addLike(): void;
  addDislike(): void;
  removeLike(): void;
  removeDislike(): void;
  likeToDislike(): void;
  dislikeToLike(): void;
  setNewestLikes(newestLikes: NewestLike[]): void;
};

type PostModelType = Model<PostType, {}, PostMethods>;

type PostDocumentType = HydratedDocument<PostType, PostMethods>;
type PostLeanDocument = LeanDocument<PostType>;

const newestLikesSchema = new Schema<NewestLike>(
  {
    addedAt: { type: 'String', required: true },
    login: { type: 'String', required: true },
    userId: { type: 'String', required: true },
  },
  {
    _id: false,
  },
);

const likesInfoSchema = new Schema<PostLikesInfoType>(
  {
    likesCount: { type: 'Number', required: true, default: 0 },
    dislikesCount: { type: 'Number', required: true, default: 0 },
    newestLikes: { type: [{ type: newestLikesSchema }], default: [] },
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
    likesInfo: {
      type: likesInfoSchema,
      default: { likesCount: 0, dislikesCount: 0, newestLikes: [] },
    },
  },
  {
    methods: {
      addLike() {
        this.likesInfo.likesCount += 1;
      },
      addDislike() {
        this.likesInfo.dislikesCount += 1;
      },
      removeLike() {
        this.likesInfo.likesCount -= 1;
      },
      removeDislike() {
        this.likesInfo.dislikesCount -= 1;
      },
      likeToDislike() {
        this.removeLike();
        this.addDislike();
      },
      dislikeToLike() {
        this.removeDislike();
        this.addLike();
      },
      setNewestLikes(newestLikes) {
        this.likesInfo.newestLikes = newestLikes;
      },
    },
  },
);

const PostModel = model<PostType, PostModelType>('Post', postSchema);

export { PostModel };
export type { PostDocumentType, PostLeanDocument };
