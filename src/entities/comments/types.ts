import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

type InputLikeStatus = {
  likeStatus: LikeStatus;
};

type LikesInfoType = {
  likesUserIds: string[];
  dislikesUserIds: string[];
};

type ViewLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

type CommentIdParamType = {
  id: string;
};

type InputCommentType = {
  content: string;
};

type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

type ViewCommentType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: ViewLikesInfoType;
  createdAt: string;
};

type CommentType = {
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: LikesInfoType;
  createdAt: Date;
};

type MongoCommentType = {
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
};

enum CommentsSortField {
  CreatedAt = 'createdAt',
}

type ViewCommentsQuery = PaginationAndSortQuery<CommentsSortField>;

export { CommentsSortField, LikeStatus };
export type {
  CommentatorInfoType,
  CommentIdParamType,
  InputCommentType,
  CommentType,
  ViewCommentType,
  MongoCommentType,
  ViewCommentsQuery,
  LikesInfoType,
  ViewLikesInfoType,
  InputLikeStatus,
};
