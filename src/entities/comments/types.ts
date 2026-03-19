import { PaginationAndSortQuery } from '../../core/types/PaginationAndSorting';

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
  createdAt: string;
};

type CommentType = {
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
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

export { CommentsSortField };
export type {
  CommentatorInfoType,
  CommentIdParamType,
  InputCommentType,
  CommentType,
  ViewCommentType,
  MongoCommentType,
  ViewCommentsQuery,
};
