type PostIdParamType = {
  id: string;
};

type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;
};

type ViewPostType = PostType & PostIdParamType;

type InputPostType = Omit<PostType, 'createdAt' | 'blogName'>;

export type { PostIdParamType, ViewPostType, PostType, InputPostType };
