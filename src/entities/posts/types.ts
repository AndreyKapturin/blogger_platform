type PostIdParamType = {
  id: string
}

type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
};

type ViewPostType = PostType & PostIdParamType & {
  blogName: string;
}

type InputPostType = Omit<PostType, 'createdAt'>

export type { PostIdParamType, ViewPostType, PostType, InputPostType };
