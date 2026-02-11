type CommentIdParamType = {
  id: string;
};

type InputCommentType = {
  content: string;
};

type ViewCommentType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
};

type CommentType = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
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

export type {
  CommentIdParamType,
  InputCommentType,
  CommentType,
  ViewCommentType,
  MongoCommentType,
};
