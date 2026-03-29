import { HydratedDocument, Model, Schema, model } from 'mongoose';
import { CommentatorInfoType, CommentType, LikesInfoType, LikeStatus } from '../types';
import {
  MIN_COMMENT_CONTENT_LENGTH_DB,
  MAX_COMMENT_CONTENT_LENGTH_DB,
} from '../../../database/constants';
import { LeanDocument } from '../../../database/types';

type CommentLeanDocument = LeanDocument<CommentType>;
type CommentMethodsType = {
  getUserLikeStatus(userId: string): LikeStatus;
  changeLikeStatus(userId: string, newLikeStatus: LikeStatus): void;
};
type CommentDocumentType = HydratedDocument<CommentType, CommentMethodsType>;

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

const _removeLike = (likesInfo: LikesInfoType, userId: string) => {
  likesInfo.likesUserIds = likesInfo.likesUserIds.filter((id) => id !== userId);
};

const _removeDislike = (likesInfo: LikesInfoType, userId: string) => {
  likesInfo.dislikesUserIds = likesInfo.dislikesUserIds.filter((id) => id !== userId);
};

const commentSchema = new Schema<CommentType, Model<CommentType>, CommentMethodsType>({
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

commentSchema.method('getUserLikeStatus', function (userId: string): LikeStatus {
  const isLike = this.likesInfo.likesUserIds.includes(userId);
  if (isLike) return LikeStatus.Like;
  const isDislike = this.likesInfo.dislikesUserIds.includes(userId);
  if (isDislike) return LikeStatus.Dislike;
  return LikeStatus.None;
});

commentSchema.method(
  'changeLikeStatus',
  function (userId: string, newLikeStatus: LikeStatus): void {
    const currentUserStatus = this.getUserLikeStatus(userId);

    switch (newLikeStatus) {
      case LikeStatus.Like:
        if (currentUserStatus === LikeStatus.Like) break;
        if (currentUserStatus === LikeStatus.Dislike) _removeDislike(this.likesInfo, userId);
        this.likesInfo.likesUserIds.push(userId);
        break;

      case LikeStatus.Dislike:
        if (currentUserStatus === LikeStatus.Dislike) break;
        if (currentUserStatus === LikeStatus.Like) _removeLike(this.likesInfo, userId);
        this.likesInfo.dislikesUserIds.push(userId);
        break;

      case LikeStatus.None:
        if (currentUserStatus === LikeStatus.Like) _removeLike(this.likesInfo, userId);
        if (currentUserStatus === LikeStatus.Dislike) _removeDislike(this.likesInfo, userId);
        break;

      default:
        break;
    }
  },
);

const CommentModel = model('Comment', commentSchema);

export { CommentModel };
export type { CommentDocumentType, CommentLeanDocument };
