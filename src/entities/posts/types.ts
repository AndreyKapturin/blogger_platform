type PostIdParamType = {
  id: string
}

type PostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

type VievPostType = PostType & {
  blogName: string;
}

type InputPostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type { PostIdParamType, VievPostType, PostType, InputPostType };
